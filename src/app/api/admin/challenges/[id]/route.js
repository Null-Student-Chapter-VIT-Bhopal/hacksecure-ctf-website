import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const adminUser = await User.findById(decoded.userId);

    if (adminUser.role === "sudo") {
      try {

        const { id } = await params;
        const { adminEmail, adminPassword } = await req.json();

        console.log("Challenge delete attempt:", { id, adminEmail });

        const user = await User.findOne({ email: adminEmail });
        if (!user || user.role !== "sudo") {
          return NextResponse.json(
            { success: false, message: "Unauthorized. Sudo access required." },
            { status: 403 }
          );
        }

        if (!adminPassword) {
          return NextResponse.json(
            {
              success: false,
              message: "Admin password is required for challenge deletion.",
            },
            { status: 400 }
          );
        }

        const isPasswordValid = await user.comparePassword(adminPassword);
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, message: "Invalid admin password." },
            { status: 401 }
          );
        }

        const challenge = await Challenge.findByIdAndDelete(id);
        if (!challenge) {
          return NextResponse.json(
            { success: false, message: "Challenge not found." },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: "Challenge deleted successfully.",
            challenge,
          },
          { status: 200 }
        );
      } catch (err) {
        console.error("Delete challenge error:", err);
        return NextResponse.json(
          { success: false, message: "Server error." },
          { status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Forbidden: Not Admin",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("JWT error:", err);

    return new Response(
      JSON.stringify({ success: false, message: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const formData = await req.json();

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "sudo") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    console.log("Challenge update attempt:", {
      challenge: id,
      user: decoded.userId,
    });

    await connectDB();

    const challenge = await Challenge.findByIdAndUpdate(id, formData, {
      new: true,
      runValidators: true,
    });

    if (!challenge) {
      return new Response(JSON.stringify({ message: "Challenge not found" }), {
        status: 404,
        success: false,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Challenge updated successfully",
        challenge,
        success: true,
      }),
      {
        status: 200,

        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("JWT error:", err);

    return new Response(
      JSON.stringify({ success: false, message: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
