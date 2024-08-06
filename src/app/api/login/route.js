import { connectToDatabase } from "../mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { users } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");
    const userId = searchParams.get("userId");

    if (email && password) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const user = await users.findOne({ email });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.password !== password) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }

      if (!user.cart) {
        await users.updateOne({ _id: user._id }, { $set: { cart: [] } });
      }

      return NextResponse.json({ userId: user._id.toString(), ok: true });
    }

    if (userId) {
      const userCart = await users
        .find({ userId: new ObjectId(userId) })
        .toArray();
      return NextResponse.json(userCart);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error in GET route:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
