import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import logger from "@/utils/logger";

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`❌ Unauthorized challenge fetch attempt | IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn(`⚠️ Invalid or expired token used | IP: ${ip} | Error: ${err.message}`);
      return NextResponse.json(
        { success: false, message: "Invalid or expired Session. Login Again..." },
        { status: 403 }
      );
    }

    await connectDB();

    const challenges = await Challenge.find(
      { visible: true },
      "-flag -visible -createdAt -updatedAt -solvedBy"
    );

    logger.info(`✅ Visible challenges fetched | Count: ${challenges.length} | IP: ${ip}`);

    return NextResponse.json({ success: true, challenges }, { status: 200 });
  } catch (err) {
    logger.error(`💀 Server error in get-challenges | IP: ${ip} | Error: ${err.stack}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
