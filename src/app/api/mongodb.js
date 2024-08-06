// mongodb.js

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

const user = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    const connectedUser = await user;
    const database = connectedUser.db("RTCA");
    const users = database.collection("Users");
    const messages = database.collection("Messages");
    return { user: connectedUser, users, messages };
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}
