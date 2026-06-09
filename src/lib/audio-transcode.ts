import { execFile } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { chmodSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";

// Resolve o binário do ffmpeg em ambientes serverless (caminhos podem variar)
// e garante permissão de execução (a Vercel às vezes perde o bit +x).
function resolveFfmpeg(): string | null {
  const candidates = [
    ffmpegPath as string | null,
    join(process.cwd(), "node_modules/ffmpeg-static/ffmpeg"),
    "/ROOT/node_modules/ffmpeg-static/ffmpeg",
    "/var/task/node_modules/ffmpeg-static/ffmpeg",
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        chmodSync(p, 0o755);
      } catch {
        /* já executável */
      }
      return p;
    }
  }
  return null;
}

// Formatos de áudio que a Cloud API do WhatsApp aceita diretamente.
const WHATSAPP_AUDIO_OK = /^audio\/(ogg|mpeg|mp3|mp4|aac|amr|x-m4a|3gpp)$/i;

export function needsTranscode(mime: string): boolean {
  // webm (Chrome) e qualquer formato fora da lista precisam virar ogg/opus.
  return !WHATSAPP_AUDIO_OK.test(mime);
}

// Transcodifica um áudio (ex.: webm/opus do Chrome) para OGG/Opus,
// formato aceito pelo WhatsApp. Lança erro REAL se o ffmpeg falhar.
export async function transcodeToOggOpus(
  input: ArrayBuffer,
  inputExt: string,
): Promise<Buffer> {
  const ffmpeg = resolveFfmpeg();
  if (!ffmpeg)
    throw new Error("ffmpeg-static indisponível (binário não encontrado)");
  const id = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const safeExt = (inputExt || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const inPath = join(tmpdir(), `wa-${id}.${safeExt}`);
  const outPath = join(tmpdir(), `wa-${id}.ogg`);
  await writeFile(inPath, Buffer.from(input));
  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        ffmpeg,
        [
          "-y",
          "-i",
          inPath,
          "-c:a",
          "libopus",
          "-b:a",
          "32k",
          "-f",
          "ogg",
          outPath,
        ],
        (err, _stdout, stderr) => {
          if (err)
            reject(
              new Error(
                `ffmpeg falhou: ${(stderr || "").slice(-500) || err.message}`,
              ),
            );
          else resolve();
        },
      );
    });
    return await readFile(outPath);
  } finally {
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
  }
}
