import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";
import jwt from "jsonwebtoken";
import logger from "@/utils/logger";

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    let currentUser = null;

    const teams = await Team.find()
      .sort({ score: -1 })
      .select("score teamName teamId");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.userId;

        const idx = teams.findIndex(u => u._id.toString() === currentUserId);
        if (idx !== -1) {
          currentUser = {
            rank: idx + 1,
            score: teams[idx].score,
            teamId: teams[idx].teamId
          };
        }
        logger.info(`✅ Leaderboard fetched with currentUser | Team ID: ${currentUserId} | Rank: ${currentUser?.rank} | IP: ${ip}`);
      } catch (err) {
        logger.warn(`⚠️ Invalid token while fetching leaderboard | IP: ${ip} | Error: ${err.message}`);
      }
    } else {
      logger.info(`ℹ️ Leaderboard fetched without currentUser | IP: ${ip}`);
    }

    const leaderboard = teams.map((u, index) => ({
      rank: index + 1,
      score: u.score,
      name: u.teamName,
      teamId: u.teamId
    }));

    return new Response(
      JSON.stringify({ success: true, leaderboard, currentUser }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    logger.error(`💀 Server error in /leaderboard | IP: ${ip} | Error: ${err.stack}`);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
