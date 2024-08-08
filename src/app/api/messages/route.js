import { NextResponse } from "next/server";
import { connectToDatabase } from "../mongodb";
import { verifyToken } from "../../utils/auth";

export async function GET(request) {
  try {
    const { messages } = await connectToDatabase();
    const receiverId = request.nextUrl.searchParams.get("receiverId");
    const token = request.headers.get("Authorization").split(" ")[1];
    const { id: currentUserId } = verifyToken(token);

    const messagesData = await messages
      .find({
        $or: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId },
        ],
      })
      .toArray();

    return NextResponse.json(messagesData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { messages } = await connectToDatabase();
    const { content, receiverId } = await request.json();
    const token = request.headers.get("Authorization").split(" ")[1];
    const { id: currentUserId } = verifyToken(token);

    if (!content || !receiverId) {
      throw new Error("Content and receiverId are required");
    }

    const newMessage = {
      senderId: currentUserId,
      receiverId,
      content,
      createdAt: new Date(),
    };

    const result = await messages.insertOne(newMessage);
    return NextResponse.json({ ...newMessage, _id: result.insertedId });
  } catch (error) {
    console.error("Error in POST /api/messages:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
