import teamSchema from "@/lib/models/Team";
import logger from "@/utils/logger";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";

const loginLimiter = rateLimit({ windowMs: 60_000, max: 5 });

export async function POST(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    if (!loginLimiter(req)) {
      logger.warn(`💀 Rate limit exceeded on Login attempt | IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts, try again later.",
        },
        { status: 429 }
      );
    }

    await connectDB();

    const { teamId, password } = await req.json();

    if (!teamId || !password) {
      logger.warn(
        `⚠️ Login attempt with missing fields → [Team: ${teamId}] [IP: ${ip}]`
      );
      return NextResponse.json(
        { success: false, message: "TeamID and Password required" },
        { status: 400 }
      );
    }

    const team = await teamSchema.findOne({ teamId }).select("+password");
    if (!team) {
      logger.warn(
        `❌ Invalid Team Login Attempt → [Team: ${teamId}] [IP: ${ip}]`
      );
      return NextResponse.json(
        { success: false, message: "Invalid TeamID.. Please Try Again" },
        { status: 400 }
      );
    }

    const isMatch = await team.matchPassword(password);
    if (!isMatch) {
      logger.warn(
        `❌ Invalid Password Attempt → [Team: ${teamId}] [IP: ${ip}]`
      );
      return NextResponse.json(
        { success: false, message: "Invalid Password.. Please Try Again" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { userId: team._id, teamId: team.teamId, role: "user",dialogPart2: "1T_M4K35_M3_PHY51C4LLY_1LL"  },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    logger.info(
      `✅ TEAM LOGIN SUCCESS → Name="${team.teamName}" | TeamID=${team.teamId} | IP=${ip}`
    );

    return NextResponse.json({
      success: true,
      message: "Login Success..",
      token: token,
      user: {
        name: team.teamName,
        id: team.teamId,
      },
    });
  } catch (err) {
    logger.error(`💀 Too Many request | IP: ${ip} | Error: ${err.stack}`);
    return NextResponse.json(
      { success: false, message: "Too many Request..!" },
      { status: 500 }
    );
  }
}
