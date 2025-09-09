import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";
import User from "@/lib/models/User";
import crypto from "crypto";
import jwt from "jsonwebtoken";

function generateTeamId() {
  const prefix = "TEAM";
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

function generatePassword() {
  const part1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part4 = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `0x00{${part1}-${part2}-${part3}-${part4}}`;
}

export async function POST(req) {
  try {
    await connectDB();

    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      console.error("JWT verify error:", err);
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    const adminUser = await User.findById(decoded.userId);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 403 }
      );
    }

    if (decoded.role !== "sudo" || adminUser.role !== "sudo") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Not Admin" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { teamName, leader, members } = body;

    if (!teamName || !leader?.name || !leader?.email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let teamId;
    let exists;
    do {
      teamId = generateTeamId();
      exists = await Team.findOne({ teamId });
    } while (exists);

    const password = generatePassword();

    const cleanedMembers = (members || []).filter(
      (m) => m?.name?.trim() && m?.email?.trim()
    );

    const team = new Team({
      teamId,
      password,
      teamName,
      leader,
      members: cleanedMembers,
      score: 0,
      solvedChallenges: [],
    });

    await team.save();

    return NextResponse.json(
      {
        success: true,
        message: "Team registered successfully",
        teamId,
        teamName,
        password,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error saving team:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
