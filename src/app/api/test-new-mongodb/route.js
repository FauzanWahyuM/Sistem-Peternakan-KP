import clientPromise from "../../../lib/mongodb-new";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "simantek");
    const users = await db.collection("user").find({}).toArray();
    return Response.json({ users: users });
  } catch (e) {
    console.error("Database error:", e);
    return Response.json({ error: "Database error: " + e.message }, { status: 500 });
  }
}