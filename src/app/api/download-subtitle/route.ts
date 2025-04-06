import https from "https";
import fs from "node:fs";
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import ffmpeg from "fluent-ffmpeg";

const compressedExtensions = ["zip"];
const subtitleExtensions = ["ass", "srt"];
const basePath = "public/subs/";

export async function POST(request: Request) {
  const req_json = await request.json();
  const url = req_json.url;
  const name = encodeURIComponent(url.split("/").findLast(() => true));
  const outputPath = `${basePath}${name}`;
  const extension = name.split(".").findLast(() => true);
  const fileType = compressedExtensions.includes(extension)
    ? "compressed"
    : subtitleExtensions.includes(extension)
      ? "subtitle"
      : "unsupported";

  if (fileType === "unsupported") {
    return NextResponse.json(
      { success: false, error: "Unsupported file format" },
      { status: 500 },
    );
  }

  try {
    await new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          const file = fs.createWriteStream(outputPath);
          response.pipe(file);

          file.on("finish", () => {
            file.close();
            resolve(true);
          });

          file.on("error", reject);
        })
        .on("error", reject);
    });

    if (fileType === "subtitle") {
      const vttPath = outputPath.replace(/\.(srt|ass)$/i, ".vtt");

      await new Promise((resolve, reject) => {
        ffmpeg(outputPath)
          .outputOptions("-y")
          .outputFormat("webvtt")
          .save(vttPath)
          .on("end", resolve)
          .on("error", reject);
      });

      return NextResponse.json({
        success: true,
        path: encodeURIComponent(vttPath.replace("public/", "")),
        format: "vtt",
        fileType,
      });
    }

    if (fileType === "compressed") {
      const contents = await extractAndListContents(outputPath, extension);
      return NextResponse.json({
        success: true,
        path: outputPath,
        fileType,
        url,
        contents,
      });
    }
  } catch (err) {
    console.error("Download failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

async function extractAndListContents(filePath: string, type: string) {
  switch (type) {
    case "zip": {
      const zip = new AdmZip(filePath);
      const extractTo = filePath.replace(/\.zip$/, "");
      zip.extractAllTo(`${extractTo}/`, true);
      const entries = zip.getEntries();
      const results = await Promise.all(
        entries.map(async (entry) => {
          if (
            entry.entryName.includes(".srt") ||
            entry.entryName.includes(".ass")
          ) {
            const path = `${extractTo}/${entry.entryName}`;
            const vttPath = path.replace(/\.(srt|ass)$/i, ".vtt");

            await new Promise((resolve, reject) => {
              ffmpeg(path)
                .outputOptions("-y")
                .outputFormat("webvtt")
                .save(vttPath)
                .on("end", resolve)
                .on("error", reject);
            });

            return {
              url: encodeURIComponent(vttPath.replace("public/", "")),
              name: entry.entryName.replace(/\.(srt|ass)$/i, ".vtt"),
            };
          }
          return;
        }),
      );

      return results.filter((e) => e);
    }
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}
