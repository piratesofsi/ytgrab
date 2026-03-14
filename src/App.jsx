import { useState, useEffect } from "react";

const API = "http://localhost:5000";

export default function App() {
  const [url, setUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [formats, setFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // animated placeholder cycling
  const placeholders = [
    "Drop a YouTube link...",
    "Paste any YouTube URL...",
    "https://youtu.be/...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const fetchVideo = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setVideo(null);
    setFormats([]);

    try {
      const [infoRes, formatsRes] = await Promise.all([
        fetch(`${API}/api/info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }),
        fetch(`${API}/api/formats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }),
      ]);

      const infoData = await infoRes.json();
      const formatsData = await formatsRes.json();

      setVideo(infoData);
      setFormats(formatsData.formats);
      setSelectedFormat(formatsData.formats[0]?.id || "");
    } catch (err) {
      setError("Could not fetch video. Check the URL and try again.");
    }

    setLoading(false);
  };

  const downloadVideo = () => {
    setDownloading(true);
    const params = new URLSearchParams({
      url,
      format: selectedFormat,
      title: video?.title || "video",
    });
    window.open(`${API}/api/download?${params}`);
    setTimeout(() => setDownloading(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchVideo();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080808;
          --surface: #111111;
          --surface2: #1a1a1a;
          --border: #222222;
          --accent: #ff3b3b;
          --accent2: #ff6b35;
          --text: #f0f0f0;
          --muted: #555555;
          --success: #00e676;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 128px;
        }

        .glow-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 70%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          animation: pulse 6s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        .wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 10vw, 96px);
          letter-spacing: 4px;
          line-height: 1;
          background: linear-gradient(135deg, #fff 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          font-size: 13px;
          color: var(--muted);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 8px;
          font-weight: 300;
        }

        .card {
          width: 100%;
          max-width: 560px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
        }

        .card-top {
          padding: 28px 28px 0;
        }

        .input-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .url-input {
          flex: 1;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 18px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .url-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,59,59,0.1);
        }

        .url-input::placeholder { color: var(--muted); }

        .fetch-btn {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 22px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(255,59,59,0.3);
        }

        .fetch-btn:hover:not(:disabled) {
          background: #ff1a1a;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(255,59,59,0.4);
        }

        .fetch-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .error-msg {
          margin: 16px 28px 0;
          padding: 12px 16px;
          background: rgba(255,59,59,0.08);
          border: 1px solid rgba(255,59,59,0.2);
          border-radius: 10px;
          color: var(--accent);
          font-size: 13px;
        }

        .loader {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 32px 28px;
          color: var(--muted);
          font-size: 13px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          height: 1px;
          background: var(--border);
          margin: 24px 0 0;
        }

        .video-section {
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .thumbnail-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .thumbnail-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, var(--surface) 100%);
        }

        .video-info {
          padding: 0 28px 20px;
        }

        .video-title {
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          margin-bottom: 20px;
          color: var(--text);
        }

        .format-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--muted);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .format-select {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 16px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          margin-bottom: 16px;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }

        .format-select:focus {
          border-color: var(--accent);
        }

        .download-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 24px rgba(255,59,59,0.35);
          position: relative;
          overflow: hidden;
        }

        .download-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .download-btn:hover:not(:disabled)::before { opacity: 1; }

        .download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,59,59,0.5);
        }

        .download-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-bottom {
          padding: 20px 28px 28px;
        }

        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>

      <div className="grain" />
      <div className="glow-orb" />

      <div className="wrapper">

        <div className="header">
          <div className="logo">YT Grab</div>
          <div className="tagline">Download anything. Keep everything.</div>
        </div>

        <div className="card">

          <div className="card-top">
            <div className="input-row">
              <input
                className="url-input"
                type="text"
                placeholder={placeholders[placeholderIndex]}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="fetch-btn"
                onClick={fetchVideo}
                disabled={loading || !url}
              >
                {loading ? "..." : "Fetch"}
              </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {loading && (
              <div className="loader">
                <div className="spinner" />
                Fetching video info...
              </div>
            )}
          </div>

          {video && (
            <div className="video-section">
              <div className="divider" />

              <div className="thumbnail-wrap">
                <img src={video.thumbnail} alt={video.title} />
                <div className="thumbnail-overlay" />
              </div>

              <div className="video-info">
                <div className="video-title">{video.title}</div>

                {formats.length > 0 && (
                  <>
                    <div className="format-label">Select Quality</div>
                    <select
                      className="format-select"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                      {formats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  className="download-btn"
                  onClick={downloadVideo}
                  disabled={downloading || !selectedFormat}
                >
                  {downloading ? "Starting..." : "⬇ Download"}
                </button>
              </div>
            </div>
          )}

          {!video && !loading && (
            <div className="card-bottom" />
          )}

        </div>

        <div className="footer">
          Personal use only — respect content creators
        </div>

      </div>
    </>
  );
}