import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";
import jwt from "jsonwebtoken";
import logger from "@/utils/logger";

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`❌ Unauthorized access to /solved-challenges | IP: ${ip}`);
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
      logger.warn(`⚠️ Invalid or expired token used on /solved-challenges | IP: ${ip} | Error: ${err.message}`);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectDB();

    const team = await Team.findById(decoded.userId);
    if (!team) {
      logger.warn(`❌ Team not found when fetching solved challenges | Team ID: ${decoded.userId} | IP: ${ip}`);
      return new Response(
        JSON.stringify({ success: false, message: "Team not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    logger.info(`✅ Solved challenges fetched | Team: ${team.teamName} | Count: ${team.solvedChallenges.length} | IP: ${ip}`);

    return new Response(
      JSON.stringify({ solved: team.solvedChallenges, success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    logger.error(`💀 Server error in /solved-challenges | IP: ${ip} | Error: ${err.stack}`);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
