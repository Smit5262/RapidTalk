import { connectToDatabase } from "../mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { users } = await connectToDatabase();
    const allUsers = await users.find({}).toArray();
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error in GET users route:", error);
    return NextResponse.json(
      { error: "Failed to fetch users. Please try again." },
      { status: 500 }
    );
  }
}
