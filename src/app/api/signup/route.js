import { NextResponse } from "next/server";
import { connectToDatabase } from "../mongodb";

export async function POST(request) {
  try {
    const { users } = await connectToDatabase();
    const body = await request.json();
    const { email, password, username, info, phoneNumber } = body;

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const userData = await users.insertOne({ email, password, username, info, phoneNumber });
    return NextResponse.json({ userData, ok: true });
  } catch (error) {
    console.error("Error in POST route:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}