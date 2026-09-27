import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "user_settings.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (err) {
    console.warn("API GET settings warning (reading fallback):", err);
    return NextResponse.json({ bentoCards: [], categories: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลลงไฟล์เซิร์ฟเวอร์ในเครื่องสำเร็ว!",
    });
  } catch (err) {
    console.error("API POST settings error:", err);
    return NextResponse.json(
      { error: "Failed to save settings to disk" },
      { status: 500 }
    );
  }
}
