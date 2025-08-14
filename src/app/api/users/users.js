import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = await db.collection("user").find({}).toArray();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: "Database error" });
  }
}