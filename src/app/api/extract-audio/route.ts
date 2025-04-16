import YTDlpWrap from "yt-dlp-wrap";
import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";

export async function POST(request: Request) {
  const { streamingLink, episodeName } = await request.json();

  const ytdlp = new YTDlpWrap();

  try {
    const command = ytdlp.exec([
      streamingLink,
      "--downloader",
      "aria2c",
      "-f",
      "worst",
      "-x",
      "--audio-format",
      "m4a",
      "--hls-use-mpegts",
      "-o",
      "public/av/out.m4a",
    ]);

    await new Promise((resolve, reject) => {
      command
        .on("close", (code) =>
          code === 0
            ? resolve(true)
            : reject(new Error(`Process exited with code ${code}`)),
        )
        .on("error", reject);
    });

    return NextResponse.json({
      success: true,
      url: "/public/av/out.m4a",
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        err: e,
      },
      { status: 500 },
    );
  }

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
