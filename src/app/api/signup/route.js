import { NextResponse } from "next/server";
import { connectToDatabase } from "../mongodb";
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/auth';

export async function POST(request) {
  try {
    const { users } = await connectToDatabase();
    const body = await request.json();
    const { email, password, username, info, phoneNumber } = body;

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ email, password: hashedPassword, username, info, phoneNumber });
    
    const token = generateToken(result.insertedId); 
    return NextResponse.json({ token, ok: true });
  } catch (error) {
    console.error("Error in POST route:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}
