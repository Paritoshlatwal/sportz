import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("DATABASE_URL is missing.");
}

declare global {
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var mongoIndexesPromise: Promise<void> | undefined;
}

const client = new MongoClient(uri);

const clientPromise = global.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  global.mongoClientPromise = clientPromise;
}

async function ensureIndexes() {
  const connectedClient = await clientPromise;
  const db = connectedClient.db();

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("posts").createIndex({ datetime: 1 }),
    db.collection("posts").createIndex({ userId: 1 }),
    db.collection("chatRequests").createIndex({ senderId: 1, postId: 1 }, { unique: true }),
    db.collection("chatRequests").createIndex({ receiverId: 1, status: 1 }),
    db.collection("chatRequests").createIndex({ senderId: 1, status: 1 }),
    db.collection("chats").createIndex({ requestId: 1 }, { unique: true }),
    db.collection("messages").createIndex({ chatId: 1, createdAt: 1 }),
    db.collection("notifications").createIndex({ userId: 1, createdAt: -1 })
  ]);
}

export async function getDatabase() {
  if (!global.mongoIndexesPromise) {
    global.mongoIndexesPromise = ensureIndexes();
  }

  await global.mongoIndexesPromise;

  const connectedClient = await clientPromise;
  return connectedClient.db();
}

export function toObjectId(value: string | ObjectId) {
  return value instanceof ObjectId ? value : new ObjectId(value);
}

export function toId(value: string | ObjectId) {
  return value instanceof ObjectId ? value.toHexString() : value;
}
