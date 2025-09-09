import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import mongoose from "mongoose";
import User from "@/lib/models/User";


export async function PATCH(req) {
  try {
    await connectDB();

    const { challengeId, visible } = await req.json();

    if (!challengeId || typeof visible !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "challengeId and visibility (bool) are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return NextResponse.json(
        { success: false, message: "Invalid challengeId format" },
        { status: 400 }
      );
    }

    // Auth check
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
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
        { status: 403 }
      );
    }

    await connectDB();
    const adminUser = await User.findById(decoded.userId);

    if (decoded.role !== "sudo" && adminUser.role !== "sudo") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Update challenge
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { visible },
      { new: true }
    );

    if (!updatedChallenge) {
      return NextResponse.json(
        { success: false, message: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Challenge visibility updated successfully",
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error("Error in PATCH /api/challenges/visibility:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
