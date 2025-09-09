import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: file.name,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await r2.send(command);

    const publicUrl = `https://pub-4d6f2392f1b642989c926f9bb5caad49.r2.dev/${file.name}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
