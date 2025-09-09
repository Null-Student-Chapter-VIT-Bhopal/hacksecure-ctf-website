import userSchema from "@/lib/models/User";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await userSchema.findOne({ email });

  console.log(user);
  console.log();
  
  

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Invalid Email.. Please Try Again" },
      { status: 400 }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return NextResponse.json(
      { success: false, message: "Invalid Password.. Please Try Again" },
      { status: 400 }
    );
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "50h" }
  );

  const response = NextResponse.json({
    success: true,
    message: "Login Success..",
    token: token,
    user: {
      name: user.name,
      email: user.email,
      id: user._id,
    },
  });

  return response;
}
