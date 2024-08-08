import { connectToDatabase } from "../mongodb";
import { NextResponse } from "next/server";
import { verifyToken } from "../../utils/auth";

export async function GET(request) {
  try {
    const { users } = await connectToDatabase();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const allUsers = await users.find({}).toArray();
  
    const transformedUsers = allUsers.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error in GET users route:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to fetch users. Please try again." },
      { status: 500 }
    );
  }
}
