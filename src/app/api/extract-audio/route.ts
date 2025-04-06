import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";

export async function POST(request: Request) {
  const { streamingLink, episodeName } = await request.json();

  return new Promise((resolve) => {
    ffmpeg(streamingLink)
      .inputOptions([
        "-fflags",
        "+discardcorrupt", // Skip bad packets
      ])
      .audioFilters([
        "aresample=async=1000", // Fix sync issues
        "highpass=f=100", // Remove low-frequency noise
        "lowpass=f=3000", // Focus on speech range
      ])
      .outputOptions([
        "-ac",
        "1", // Mono audio (better for speech)
        "-ar",
        "16000", // Whisper's optimal sample rate
        "-t",
        "10000", // Safety limit
        "-f",
        "wav", // Uncompressed format
        "-c:a",
        "pcm_s16le", // Whisper's preferred encoding
      ])
      .output(`public/${episodeName}.wav`) // .wav > .aac for Whisper
      .on("end", () => {
        resolve(
          NextResponse.json({
            success: true,
            url: `public/${episodeName}.wav`,
          }),
        );
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        resolve(
          NextResponse.json(
            { success: false, error: err.message },
            { status: 500 },
          ),
        );
      })
      .run();
  });
}
