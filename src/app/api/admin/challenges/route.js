import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
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

    console.log({ decoded, adminUser });
    if (decoded.role === "sudo" && adminUser.role === "sudo") {
      await connectDB();
      const challenges = await Challenge.find({});

      return new Response(
        JSON.stringify({
          success: true,
          role: decoded.role,
          challenges,
          message: "Admin access granted",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          role: decoded.role,
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

export async function POST(req) {
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

    console.log({ decoded, adminUser });
    if (decoded.role === "sudo" && adminUser.role === "sudo") {
      const {
        name,
        author,
        description,
        category,
        value,
        flag,
        file_url,
        visible,
      } = await req.json();
      await connectDB();

      const newChallenge = new Challenge({
        name,
        author,
        description,
        category,
        value,
        flag,
        file_url,
        visible,
      });

      await newChallenge.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Uploaded Successfully",
          newChallenge,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
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
