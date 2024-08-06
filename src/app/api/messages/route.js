import { connectToDatabase } from "../mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { messages } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");

    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };

    const chatMessages = await messages
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
    return NextResponse.json(chatMessages);
  } catch (error) {
    console.error("Error in GET messages route:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { messages } = await connectToDatabase();
    const { senderId, receiverId, content } = await request.json();

    const newMessage = {
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    };

    const result = await messages.insertOne(newMessage);
    return NextResponse.json({ ...newMessage, _id: result.insertedId });
  } catch (error) {
    console.error("Error in POST messages route:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
