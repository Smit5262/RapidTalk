import { connectToDatabase } from "../mongodb";
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/auth';

export async function POST(request) {
  try {
    const { users } = await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await users.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = generateToken(user);

    return new Response(
      JSON.stringify({ token, ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
