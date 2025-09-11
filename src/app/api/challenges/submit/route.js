import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import Team from "@/lib/models/Team";
import jwt from "jsonwebtoken";
import logger from "@/utils/logger";
import { rateLimit } from "@/lib/rateLimiter";
import { NextResponse } from "next/server";

const loginLimiter = rateLimit({ windowMs: 60_000, max: 5 });

export async function POST(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    if (!loginLimiter(req)) {
      logger.warn(`💀 Rate limit exceeded on Challenge submit | IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts, try again later.",
        },
        { status: 429 }
      );
    }
    let body;
    try {
      body = await req.json();
    } catch (err) {
      logger.warn(
        `⚠️ Invalid JSON body in /submit | IP: ${ip} | Error: ${err.message}`
      );
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { challengeId, flag } = body;
    if (!challengeId || !flag) {
      logger.warn(`⚠️ Missing challengeId or flag in /submit | IP: ${ip}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing challengeId or flag",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`❌ Unauthorized access to /submit | IP: ${ip}`);
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn(
        `⚠️ Invalid/expired token on /submit | IP: ${ip} | Error: ${err.message}`
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Session Expired or Unauthorized Access.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectDB();

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      logger.warn(
        `❌ Challenge not found | Challenge ID: ${challengeId} | IP: ${ip}`
      );
      return new Response(
        JSON.stringify({ success: false, message: "Challenge not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const team = await Team.findById(decoded.userId);
    if (!team) {
      logger.warn(
        `❌ Team not found during /submit | Team ID: ${decoded.userId} | IP: ${ip}`
      );
      return new Response(
        JSON.stringify({ success: false, message: "Team not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Already solved
    if (
      team.solvedChallenges.includes(challengeId) ||
      challenge.solvedBy.includes(decoded.userId)
    ) {
      logger.info(
        `⚠️ Challenge already solved | Challenge ID: ${challengeId} | Team: ${team.teamName} | IP: ${ip}`
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Challenge already solved...",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Correct flag
    if (flag === challenge.flag) {
      // team.solvedChallenges.push(challengeId);
      // team.score += challenge.value;
      // await team.save();

      // challenge.solvedBy.push(decoded.userId);
      // await challenge.save();

      logger.info(
        `✅ TRIED SOLVING FLAG AFTER CHALLENGE END | Challenge: ${challenge.name} | Submitted Flag: ${flag} | Team: ${team.teamName} | New Score: ${team.score} | IP: ${ip}`
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Flag Submission Ended",
          newScore: team.score,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      logger.info(
        `❌ Incorrect flag submitted | Challenge: ${challenge.name} | Submitted Flag: ${flag} | Team: ${team.teamName} | IP: ${ip}`
      );
      return new Response(
        JSON.stringify({ success: false, message: "Flag Submission Ended" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    logger.error(
      `💀 Server error in /submit | IP: ${ip} | Error: ${err.stack}`
    );
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
