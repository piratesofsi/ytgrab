# YTGrab

A full-stack YouTube video downloader built with React and Express. Paste a URL, pick your quality, and download with properly merged audio and video.

## Features

- Fetch video title and thumbnail instantly
- Select quality from 360p up to 2160p (4K)
- Proper audio and video merge via ffmpeg
- Fast streaming from server to browser
- Clean dark UI built with Tailwind CSS

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| Downloader | yt-dlp |
| Media Processing | ffmpeg |

## Prerequisites

Before running this project, make sure you have:

- [Node.js](https://nodejs.org/) installed
- [Python](https://python.org/) installed
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — `pip install yt-dlp`
- [ffmpeg](https://ffmpeg.org/) — `winget install ffmpeg`
- [Deno](https://deno.com/) — `winget install deno`

## Setup and Run

### 1. Clone the repo
```bash
git clone https://github.com/piratesofsi/ytgrab.git
cd ytgrab
```

### 2. Start the backend
```bash
cd server
npm install
node server.js
```

### 3. Start the frontend
```bash
# in a new terminal, from the root folder
npm install
npm run dev
```

### 4. Open the app
```
http://localhost:5173
```

## How It Works
```
User pastes URL
  -> Frontend calls /api/info and /api/formats
  -> Server runs yt-dlp to get video info and available qualities
  -> User picks quality and clicks Download
  -> Server downloads video and audio streams separately
  -> ffmpeg merges them into a single mp4
  -> File streams to browser and save dialog appears
```

## Project Structure
```
ytgrab/
  server/
    server.js        — Express API with 3 routes: info, formats, download
    package.json
  src/
    App.jsx          — React frontend
    main.jsx
  index.html
  package.json
```

## Disclaimer

This project is for educational and personal use only. Downloading YouTube videos may violate YouTube's Terms of Service. Do not use this to download copyrighted content without permission.