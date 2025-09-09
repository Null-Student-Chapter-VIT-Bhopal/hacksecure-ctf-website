import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";
import logger from "@/utils/logger";

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`❌ Unauthorized team fetch attempt | IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn(`⚠️ Invalid token used | IP: ${ip} | Error: ${err.message}`);
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 403 }
      );
    }

    const team = await Team.findById(decoded.userId).select(
      "teamName leader.name leader.email members.name members.email"
    );

    if (!team) {
      logger.warn(`❌ Invalid Team Lookup → Team ID: ${decoded.userId} | IP: ${ip}`);
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    // Successful fetch
    logger.info(`✅ Team Details Fetched → Team: ${team.teamName} | IP: ${ip}`);

    return NextResponse.json({
      success: true,
      data: {
        teamName: team.teamName,
        leader: {
          name: team.leader.name,
          email: team.leader.email,
        },
        members: team.members.map((m) => ({
          name: m.name,
          email: m.email,
        })),
      },
    });
  } catch (error) {
    logger.error(`💀 Server error in get-team | IP: ${ip} | Error: ${error.stack}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
