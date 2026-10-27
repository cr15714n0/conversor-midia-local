import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const DATA_DIR = "/app/data";
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const OUTPUT_DIR = path.join(DATA_DIR, "output");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// In-memory job tracker
const jobs = new Map();

function getDuration(filePath) {
  try {
    const probe = spawnSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);
    return parseFloat(probe.stdout?.toString()?.trim() || "0") || 0;
  } catch (e) {
    return 0;
  }
}

async function convertFile(job) {
  const { id, inputPath, originalName, targetFormat } = job;
  const parsed = path.parse(originalName);
  const outFileName = `${parsed.name}.${targetFormat}`;
  const outPath = path.join(OUTPUT_DIR, `${id}_${outFileName}`);
  job.outFileName = outFileName;
  job.outPath = outPath;

  const isVideoOrAudio = [
    "mp4", "webm", "mkv", "avi", "mov", "flv", "gif",
    "mp3", "wav", "m4a", "flac", "aac", "ogg"
  ].includes(targetFormat.toLowerCase());

  if (isVideoOrAudio) {
    const duration = getDuration(inputPath);
    job.duration = duration;

    let extraArgs = [];
    if (targetFormat === "gif") {
      extraArgs = ["-vf", "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"];
    } else if (targetFormat === "mp4") {
      extraArgs = ["-c:v", "libx264", "-c:a", "aac", "-preset", "veryfast", "-crf", "23"];
    } else if (targetFormat === "webm") {
      extraArgs = ["-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-c:a", "libopus"];
    } else if (targetFormat === "mp3") {
      extraArgs = ["-vn", "-c:a", "libmp3lame", "-q:a", "2"];
    } else if (targetFormat === "wav") {
      extraArgs = ["-vn", "-c:a", "pcm_s16le"];
    } else {
      extraArgs = ["-preset", "veryfast"];
    }

    const args = [
      "-progress", "pipe:1",
      "-nostats",
      "-i", inputPath,
      ...extraArgs,
      "-y",
      outPath
    ];

    const child = spawn("ffmpeg", args);
    let lastUpdate = 0;
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      const matchTime = text.match(/out_time_us=(\d+)/);
      const matchSpeed = text.match(/speed=\s*([0-9.]+x)/);
      if (matchTime && duration > 0) {
        const outTimeSec = parseInt(matchTime[1], 10) / 1000000;
        const percent = Math.min(99, Math.round((outTimeSec / duration) * 100));
        const speed = matchSpeed ? matchSpeed[1] : "";
        const spdNum = parseFloat(speed) || 1;
        const eta = Math.max(0, Math.round((duration - outTimeSec) / spdNum));

        job.percent = percent;
        job.speed = speed;
        job.eta = `${eta}s`;
        job.status = "converting";
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 20000) stderr = stderr.slice(-10000);
    });

    child.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath)) {
        job.percent = 100;
        job.status = "done";
        job.outSize = fs.statSync(outPath).size;
      } else {
        job.status = "error";
        job.error = `FFmpeg falhou (código ${code})`;
        console.error("FFmpeg error:", stderr);
      }
    });
  } else {
    // Image conversion using ImageMagick
    job.status = "converting";
    job.percent = 50;

    let args = [inputPath, outPath];
    if (targetFormat === "webp") {
      args = [inputPath, "-quality", "85", outPath];
    } else if (targetFormat === "jpg" || targetFormat === "jpeg") {
      args = [inputPath, "-quality", "90", outPath];
    }

    const child = spawn("magick", args);
    child.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath)) {
        job.percent = 100;
        job.status = "done";
        job.outSize = fs.statSync(outPath).size;
      } else {
        job.status = "error";
        job.error = `Falha na conversão de imagem`;
      }
    });
  }
}

// Bun HTTP Server
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // API: Start conversion
    if (url.pathname === "/api/convert" && req.method === "POST") {
      try {
        const formData = await req.formData();
        const file = formData.get("file");
        const targetFormat = formData.get("format") || "mp4";

        if (!file || typeof file === "string") {
          return new Response(JSON.stringify({ error: "Nenhum arquivo enviado" }), { status: 400 });
        }

        const id = Math.random().toString(36).substring(2, 10);
        const inputPath = path.join(UPLOAD_DIR, `${id}_${file.name}`);
        await Bun.write(inputPath, file);

        const job = {
          id,
          originalName: file.name,
          inputSize: file.size,
          inputPath,
          targetFormat: targetFormat.toLowerCase(),
          percent: 0,
          speed: "",
          eta: "",
          status: "queued",
          createdAt: Date.now()
        };

        jobs.set(id, job);
        convertFile(job);

        return new Response(JSON.stringify({ id, fileName: file.name }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
      }
    }

    // API: Check progress
    if (url.pathname.startsWith("/api/progress/")) {
      const id = url.pathname.replace("/api/progress/", "");
      const job = jobs.get(id);
      if (!job) {
        return new Response(JSON.stringify({ error: "Job não encontrado" }), { status: 404 });
      }
      return new Response(JSON.stringify({
        id: job.id,
        status: job.status,
        percent: job.percent,
        speed: job.speed,
        eta: job.eta,
        error: job.error,
        outFileName: job.outFileName,
        outSize: job.outSize
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // API: Download converted file
    if (url.pathname.startsWith("/api/download/")) {
      const id = url.pathname.replace("/api/download/", "");
      const job = jobs.get(id);
      if (!job || !job.outPath || !fs.existsSync(job.outPath)) {
        return new Response("Arquivo não encontrado", { status: 404 });
      }
      return new Response(Bun.file(job.outPath), {
        headers: {
          "Content-Disposition": `attachment; filename="${job.outFileName}"`
        }
      });
    }

    // Serve HTML
    const htmlFile = Bun.file("/app/custom-app/public/index.html");
    if (await htmlFile.exists()) {
      return new Response(htmlFile, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return new Response("App carregando...", { status: 200 });
  }
});

console.log(`✨ Servidor do Conversor Local rodando com sucesso em http://localhost:${PORT}`);
