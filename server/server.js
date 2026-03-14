const express = require("express");
const cors = require("cors");
const YTDlpWrap = require("yt-dlp-wrap").default;
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");

const execAsync = promisify(exec);
const app = express();
const ytDlp = new YTDlpWrap();

// exact paths to ffmpeg and deno
const FFMPEG = `C:\\Users\\LapX\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe`;
const DENO = `C:\\Users\\LapX\\AppData\\Local\\Microsoft\\WinGet\\Packages\\DenoLand.Deno_Microsoft.Winget.Source_8wekyb3d8bbwe\\deno.exe`;

app.use(cors());
app.use(express.json());

process.on("uncaughtException", (err) => console.log("UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.log("UNHANDLED:", err));

// video info
app.post("/api/info", async (req, res) => {
  try {

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-playlist --ffmpeg-location "${FFMPEG}" --js-runtimes "deno:${DENO}" "${url}"`
    );

    const info = JSON.parse(stdout);

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
    });

  } catch (err) {
    console.log("INFO ERROR:", err.message);
    res.status(500).json({ error: "Could not fetch video info" });
  }
});


// get available formats 
app.post("/api/formats", async (req, res) => {
  try {

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-playlist --ffmpeg-location "${FFMPEG}" --js-runtimes "deno:${DENO}" "${url}"`
    );

    const info = JSON.parse(stdout);

    const formats = info.formats

      .filter(f =>
        f.vcodec !== "none" &&
        f.height &&
        f.height >= 360
      )

      .map(f => ({
        id: f.format_id,
        height: f.height,
        label: `${f.height}p — ${f.ext} (~${Math.round((f.filesize || f.filesize_approx || 0) / 1024 / 1024)} MB)`
      }))

      .filter((f, index, self) =>
        index === self.findIndex(x => x.height === f.height)
      )

      .sort((a, b) => b.height - a.height);

    formats.unshift({
      id: "bestvideo+bestaudio/best",
      height: 9999,
      label: "⭐ Best Quality (Auto)"
    });

    res.json({ formats });

  } catch (err) {
    console.log("FORMATS ERROR:", err.message);
    res.status(500).json({ error: "Could not fetch formats" });
  }
});


// download video 
app.get("/api/download", async (req, res) => {

  const tmpFile = path.join(os.tmpdir(), `yt-${Date.now()}.mp4`);

  try {

    const { url, format, title } = req.query;
    if (!url) return res.status(400).send("URL required");

    const safeTitle = (title || "video").replace(/[^\w\s-]/g, "").trim() || "video";

    const formatStr = (format && (format.includes("+") || format === "best"))
      ? format
      : `${format}+bestaudio/best`;

    console.log(`⬇ Downloading: ${safeTitle}`);
    console.log(`📁 Temp file: ${tmpFile}`);
    console.log(`🎬 Format: ${formatStr}`);

    const cmd = `yt-dlp -f "${formatStr}" --merge-output-format mp4 --ffmpeg-location "${FFMPEG}" --js-runtimes "deno:${DENO}" -o "${tmpFile}" --no-playlist "${url}"`;
    console.log(`💻 Running: ${cmd}`);

    const { stdout, stderr } = await execAsync(cmd, {
      maxBuffer: 1024 * 1024 * 1024
    });

    console.log("stdout:", stdout);
    console.log("stderr:", stderr);

    if (!fs.existsSync(tmpFile)) {
      console.log("❌ File not found after download!");
      return res.status(500).send("File not created");
    }

    const fileSize = fs.statSync(tmpFile).size;
    console.log(`✅ File ready! Size: ${fileSize} bytes`);

    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp4"`);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", fileSize);

    const fileStream = fs.createReadStream(tmpFile);
    fileStream.pipe(res);

    fileStream.on("close", () => {
      fs.unlink(tmpFile, () => console.log("🗑 Temp file deleted"));
    });

  } catch (err) {
    console.log("❌ DOWNLOAD ERROR:", err.message);
    console.log("❌ FULL ERROR:", err);
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (!res.headersSent) res.status(500).send("Download failed: " + err.message);
  }

});



app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});