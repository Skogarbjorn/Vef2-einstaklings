import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export function POST() {
  const subsDir = path.join(process.cwd(), "public", "subs");

  try {
    if (fs.existsSync(subsDir)) {
      const files = fs.readdirSync(subsDir);
      for (const file of files) {
        fs.rmSync(path.join(subsDir, file), { recursive: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      {
        status: 500,
      },
    );
  }
}
