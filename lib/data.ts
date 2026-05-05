import { MongoServerError, ObjectId } from "mongodb";

import {
  CHAT_REQUEST_STATUS,
  type ChatRequestStatus,
  type NotificationType
} from "@/lib/db-types";
import { getDatabase, toId, toObjectId } from "@/lib/mongodb";

type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type PostDoc = {
  _id: ObjectId;
  sport: string;
  locationName: string;
  mapLink: string;
  datetime: Date;
  description: string | null;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type ChatRequestDoc = {
  _id: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  postId: ObjectId;
  status: ChatRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

type ChatDoc = {
  _id: ObjectId;
  requestId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type MessageDoc = {
  _id: ObjectId;
  chatId: ObjectId;
  senderId: ObjectId;
  content: string;
  createdAt: Date;
};

type NotificationDoc = {
  _id: ObjectId;
  userId: ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
};

function uniqueObjectIds(ids: ObjectId[]) {
  const seen = new Set<string>();

  return ids.filter((id) => {
    const key = id.toHexString();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function keyByObjectId<T extends { _id: ObjectId }>(items: T[]) {
  return new Map(items.map((item) => [item._id.toHexString(), item]));
}

function serializeUserBasic(user: Pick<UserDoc, "_id" | "name" | "email"> | null | undefined) {
  if (!user) {
    return null;
  }

  return {
    id: toId(user._id),
    name: user.name,
    email: user.email
  };
}

function serializePost(post: PostDoc) {
  return {
    id: toId(post._id),
    sport: post.sport,
    locationName: post.locationName,
    mapLink: post.mapLink,
    datetime: post.datetime,
    description: post.description,
    userId: toId(post.userId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

function serializeChatRequest(request: ChatRequestDoc) {
  return {
    id: toId(request._id),
    senderId: toId(request.senderId),
    receiverId: toId(request.receiverId),
    postId: toId(request.postId),
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  };
}

function serializeMessage(message: MessageDoc) {
  return {
    id: toId(message._id),
    chatId: toId(message.chatId),
    senderId: toId(message.senderId),
    content: message.content,
    createdAt: message.createdAt
  };
}

function serializeNotification(notification: NotificationDoc) {
  return {
    id: toId(notification._id),
    userId: toId(notification.userId),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    isRead: notification.isRead,
    metadata: notification.metadata ?? null,
    createdAt: notification.createdAt
  };
}

async function getUsersMapByIds(ids: ObjectId[]) {
  const uniqueIds = uniqueObjectIds(ids);

  if (uniqueIds.length === 0) {
    return new Map<string, UserDoc>();
  }

  const db = await getDatabase();
  const users = await db
    .collection<UserDoc>("users")
    .find({ _id: { $in: uniqueIds } })
    .toArray();

  return keyByObjectId(users);
}

async function getPostsMapByIds(ids: ObjectId[]) {
  const uniqueIds = uniqueObjectIds(ids);

  if (uniqueIds.length === 0) {
    return new Map<string, PostDoc>();
  }

  const db = await getDatabase();
  const posts = await db
    .collection<PostDoc>("posts")
    .find({ _id: { $in: uniqueIds } })
    .toArray();

  return keyByObjectId(posts);
}

export async function getUserByEmail(email: string) {
  const db = await getDatabase();
  const user = await db.collection<UserDoc>("users").findOne({ email });

  if (!user) {
    return null;
  }

  return {
    id: toId(user._id),
    name: user.name,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const db = await getDatabase();
  const now = new Date();

  const document = {
    name: input.name,
    email: input.email,
    password: input.password,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<Omit<UserDoc, "_id">>("users").insertOne(document);

  return {
    id: toId(result.insertedId),
    ...document
  };
}

export function isDuplicateKeyError(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000;
}

export async function getFeedPosts(input: {
  sport?: string;
  location?: string;
  currentUserId?: string;
  mineUserId?: string;
}) {
  const db = await getDatabase();
  const query: Record<string, unknown> = {
    datetime: {
      $gte: new Date()
    }
  };

  if (input.sport) {
    query.sport = input.sport;
  }

  if (input.location) {
    query.locationName = input.location;
  }

  if (input.mineUserId) {
    query.userId = toObjectId(input.mineUserId);
  }

  const posts = await db.collection<PostDoc>("posts").find(query).sort({ datetime: 1 }).toArray();
  const usersMap = await getUsersMapByIds(posts.map((post) => post.userId));

  let requestsByPost = new Map<string, { id: string; status: ChatRequestStatus }[]>();

  if (input.currentUserId && posts.length > 0) {
    const chatRequests = await db
      .collection<ChatRequestDoc>("chatRequests")
      .find({
        senderId: toObjectId(input.currentUserId),
        postId: {
          $in: posts.map((post) => post._id)
        }
      })
      .toArray();

    requestsByPost = new Map<string, { id: string; status: ChatRequestStatus }[]>();

    for (const request of chatRequests) {
      const key = toId(request.postId);
      const current = requestsByPost.get(key) ?? [];
      current.push({ id: toId(request._id), status: request.status });
      requestsByPost.set(key, current);
    }
  }

  return posts.map((post) => ({
    ...serializePost(post),
    user: (() => {
      const user = usersMap.get(toId(post.userId));

      if (!user) {
        return {
          id: toId(post.userId),
          name: "Unknown player"
        };
      }

      return {
        id: toId(user._id),
        name: user.name
      };
    })(),
    chatRequests: requestsByPost.get(toId(post._id)) ?? []
  }));
}

export async function createPost(input: {
  sport: string;
  locationName: string;
  mapLink: string;
  datetime: Date;
  description?: string | null;
  userId: string;
}) {
  const db = await getDatabase();
  const now = new Date();

  const document = {
    sport: input.sport,
    locationName: input.locationName,
    mapLink: input.mapLink,
    datetime: input.datetime,
    description: input.description ?? null,
    userId: toObjectId(input.userId),
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<Omit<PostDoc, "_id">>("posts").insertOne(document);

  return {
    id: toId(result.insertedId),
    ...document,
    userId: input.userId
  };
}

export async function getPostById(postId: string) {
  const db = await getDatabase();
  const post = await db.collection<PostDoc>("posts").findOne({ _id: toObjectId(postId) });

  if (!post) {
    return null;
  }

  const user = await db.collection<UserDoc>("users").findOne({ _id: post.userId });

  return {
    ...serializePost(post),
    user: user
      ? {
          id: toId(user._id),
          name: user.name,
          email: user.email
        }
      : null
  };
}

export async function findChatRequestBySenderAndPost(senderId: string, postId: string) {
  const db = await getDatabase();
  const request = await db.collection<ChatRequestDoc>("chatRequests").findOne({
    senderId: toObjectId(senderId),
    postId: toObjectId(postId)
  });

  return request ? serializeChatRequest(request) : null;
}

export async function createChatRequest(input: {
  senderId: string;
  receiverId: string;
  postId: string;
}) {
  const db = await getDatabase();
  const now = new Date();

  const document = {
    senderId: toObjectId(input.senderId),
    receiverId: toObjectId(input.receiverId),
    postId: toObjectId(input.postId),
    status: CHAT_REQUEST_STATUS.PENDING,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection<Omit<ChatRequestDoc, "_id">>("chatRequests").insertOne(document);

  return {
    id: toId(result.insertedId),
    ...document,
    senderId: input.senderId,
    receiverId: input.receiverId,
    postId: input.postId
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const db = await getDatabase();
  const document = {
    userId: toObjectId(input.userId),
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
    isRead: false,
    metadata: input.metadata ?? null,
    createdAt: new Date()
  };

  const result = await db.collection<Omit<NotificationDoc, "_id">>("notifications").insertOne(document);

  return {
    id: toId(result.insertedId),
    ...document,
    userId: input.userId
  };
}

export async function getChatRequestById(requestId: string) {
  const db = await getDatabase();
  const request = await db
    .collection<ChatRequestDoc>("chatRequests")
    .findOne({ _id: toObjectId(requestId) });

  if (!request) {
    return null;
  }

  const [post, sender] = await Promise.all([
    db.collection<PostDoc>("posts").findOne({ _id: request.postId }),
    db.collection<UserDoc>("users").findOne({ _id: request.senderId })
  ]);

  return {
    ...serializeChatRequest(request),
    post: post ? serializePost(post) : null,
    sender: sender ? serializeUserBasic(sender) : null
  };
}

export async function updateChatRequestStatus(requestId: string, status: ChatRequestStatus) {
  const db = await getDatabase();

  await db.collection<ChatRequestDoc>("chatRequests").updateOne(
    { _id: toObjectId(requestId) },
    {
      $set: {
        status,
        updatedAt: new Date()
      }
    }
  );
}

export async function ensureChatForRequest(requestId: string) {
  const db = await getDatabase();
  const now = new Date();

  await db.collection<ChatDoc>("chats").updateOne(
    { requestId: toObjectId(requestId) },
    {
      $setOnInsert: {
        requestId: toObjectId(requestId),
        createdAt: now,
        updatedAt: now
      }
    },
    { upsert: true }
  );
}

async function getChatContextRaw(chatId: string) {
  const db = await getDatabase();
  const chat = await db.collection<ChatDoc>("chats").findOne({ _id: toObjectId(chatId) });

  if (!chat) {
    return null;
  }

  const request = await db
    .collection<ChatRequestDoc>("chatRequests")
    .findOne({ _id: chat.requestId });

  if (!request) {
    return null;
  }

  return { chat, request };
}

export async function getChatContext(chatId: string) {
  const raw = await getChatContextRaw(chatId);

  if (!raw) {
    return null;
  }

  return {
    id: toId(raw.chat._id),
    requestId: toId(raw.chat.requestId),
    senderId: toId(raw.request.senderId),
    receiverId: toId(raw.request.receiverId),
    postId: toId(raw.request.postId),
    status: raw.request.status,
    createdAt: raw.chat.createdAt,
    updatedAt: raw.chat.updatedAt
  };
}

export async function getMessagesForChat(chatId: string) {
  const db = await getDatabase();
  const messages = await db
    .collection<MessageDoc>("messages")
    .find({ chatId: toObjectId(chatId) })
    .sort({ createdAt: 1 })
    .toArray();

  const usersMap = await getUsersMapByIds(messages.map((message) => message.senderId));

  return messages.map((message) => {
    const sender = usersMap.get(toId(message.senderId));

    return {
      ...serializeMessage(message),
      sender: sender
        ? {
            id: toId(sender._id),
            name: sender.name
          }
        : {
            id: toId(message.senderId),
            name: "Unknown player"
          }
    };
  });
}

export async function createMessage(input: {
  chatId: string;
  senderId: string;
  content: string;
}) {
  const db = await getDatabase();
  const document = {
    chatId: toObjectId(input.chatId),
    senderId: toObjectId(input.senderId),
    content: input.content,
    createdAt: new Date()
  };

  const result = await db.collection<Omit<MessageDoc, "_id">>("messages").insertOne(document);
  const sender = await db.collection<UserDoc>("users").findOne({ _id: document.senderId });

  return {
    id: toId(result.insertedId),
    chatId: input.chatId,
    senderId: input.senderId,
    content: input.content,
    createdAt: document.createdAt,
    sender: sender
      ? {
          id: toId(sender._id),
          name: sender.name
        }
      : {
          id: input.senderId,
          name: "Unknown player"
        }
  };
}

export async function touchChat(chatId: string) {
  const db = await getDatabase();

  await db.collection<ChatDoc>("chats").updateOne(
    { _id: toObjectId(chatId) },
    {
      $set: {
        updatedAt: new Date()
      }
    }
  );
}

export async function getChatsForUser(userId: string) {
  const db = await getDatabase();
  const userObjectId = toObjectId(userId);

  const requests = await db
    .collection<ChatRequestDoc>("chatRequests")
    .find({
      status: CHAT_REQUEST_STATUS.ACCEPTED,
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }]
    })
    .toArray();

  if (requests.length === 0) {
    return [];
  }

  const chats = await db
    .collection<ChatDoc>("chats")
    .find({
      requestId: {
        $in: requests.map((request) => request._id)
      }
    })
    .sort({ updatedAt: -1 })
    .toArray();

  const requestMap = keyByObjectId(requests);
  const postsMap = await getPostsMapByIds(requests.map((request) => request.postId));
  const usersMap = await getUsersMapByIds(
    requests.flatMap((request) => [request.senderId, request.receiverId])
  );

  const lastMessagesRaw = await db
    .collection<MessageDoc>("messages")
    .aggregate<{ _id: ObjectId; message: MessageDoc }>([
      {
        $match: {
          chatId: {
            $in: chats.map((chat) => chat._id)
          }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$chatId",
          message: { $first: "$$ROOT" }
        }
      }
    ])
    .toArray();

  const lastMessagesMap = new Map(
    lastMessagesRaw.map((item) => [toId(item._id), item.message])
  );

  return chats.map((chat) => {
    const request = requestMap.get(toId(chat.requestId));

    if (!request) {
      return null;
    }

    const post = postsMap.get(toId(request.postId));
    const sender = usersMap.get(toId(request.senderId));
    const receiver = usersMap.get(toId(request.receiverId));
    const lastMessage = lastMessagesMap.get(toId(chat._id));

    return {
      id: toId(chat._id),
      requestId: toId(chat.requestId),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      request: {
        ...serializeChatRequest(request),
        post: post
          ? serializePost(post)
          : {
              id: toId(request.postId),
              sport: "",
              locationName: "",
              mapLink: "",
              datetime: chat.createdAt,
              description: null,
              userId: "",
              createdAt: chat.createdAt,
              updatedAt: chat.updatedAt
            },
        sender:
          sender?.name && sender?.email
            ? { id: toId(sender._id), name: sender.name }
            : { id: toId(request.senderId), name: "Unknown player" },
        receiver:
          receiver?.name && receiver?.email
            ? { id: toId(receiver._id), name: receiver.name }
            : { id: toId(request.receiverId), name: "Unknown player" }
      },
      messages: lastMessage
        ? [
            {
              ...serializeMessage(lastMessage),
              sender: {
                name: usersMap.get(toId(lastMessage.senderId))?.name ?? "Unknown player"
              }
            }
          ]
        : []
    };
  }).filter(Boolean) as Array<{
    id: string;
    requestId: string;
    createdAt: Date;
    updatedAt: Date;
    request: {
      id: string;
      senderId: string;
      receiverId: string;
      postId: string;
      status: ChatRequestStatus;
      createdAt: Date;
      updatedAt: Date;
      post: ReturnType<typeof serializePost>;
      sender: { id: string; name: string };
      receiver: { id: string; name: string };
    };
    messages: Array<{
      id: string;
      chatId: string;
      senderId: string;
      content: string;
      createdAt: Date;
      sender: { name: string };
    }>;
  }>;
}

export async function getChatByIdWithDetails(chatId: string) {
  const raw = await getChatContextRaw(chatId);

  if (!raw) {
    return null;
  }

  const db = await getDatabase();
  const [post, sender, receiver, messages] = await Promise.all([
    db.collection<PostDoc>("posts").findOne({ _id: raw.request.postId }),
    db.collection<UserDoc>("users").findOne({ _id: raw.request.senderId }),
    db.collection<UserDoc>("users").findOne({ _id: raw.request.receiverId }),
    getMessagesForChat(chatId)
  ]);

  return {
    id: toId(raw.chat._id),
    requestId: toId(raw.chat.requestId),
    createdAt: raw.chat.createdAt,
    updatedAt: raw.chat.updatedAt,
    request: {
      ...serializeChatRequest(raw.request),
      post: post ? serializePost(post) : null,
      sender: sender ? { id: toId(sender._id), name: sender.name } : null,
      receiver: receiver ? { id: toId(receiver._id), name: receiver.name } : null
    },
    messages
  };
}

export async function getNotificationsForUser(userId: string) {
  const db = await getDatabase();
  const [items, unreadCount] = await Promise.all([
    db
      .collection<NotificationDoc>("notifications")
      .find({ userId: toObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(12)
      .toArray(),
    db.collection<NotificationDoc>("notifications").countDocuments({
      userId: toObjectId(userId),
      isRead: false
    })
  ]);

  return {
    items: items.map((item) => serializeNotification(item)),
    unreadCount
  };
}

export async function markNotificationsAsRead(userId: string) {
  const db = await getDatabase();

  await db.collection<NotificationDoc>("notifications").updateMany(
    {
      userId: toObjectId(userId),
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  );
}

export async function getPostsByUser(userId: string) {
  const db = await getDatabase();
  const userObjectId = toObjectId(userId);
  const posts = await db
    .collection<PostDoc>("posts")
    .find({ userId: userObjectId })
    .sort({ datetime: 1 })
    .toArray();

  const requests = await db
    .collection<ChatRequestDoc>("chatRequests")
    .find({
      postId: {
        $in: posts.map((post) => post._id)
      }
    })
    .toArray();

  const requestsByPost = new Map<string, Array<{ id: string; status: ChatRequestStatus }>>();

  for (const request of requests) {
    const key = toId(request.postId);
    const current = requestsByPost.get(key) ?? [];
    current.push({ id: toId(request._id), status: request.status });
    requestsByPost.set(key, current);
  }

  return posts.map((post) => ({
    ...serializePost(post),
    chatRequests: requestsByPost.get(toId(post._id)) ?? []
  }));
}

export async function getRequestsForUser(userId: string) {
  const db = await getDatabase();
  const userObjectId = toObjectId(userId);

  const [incoming, outgoing] = await Promise.all([
    db
      .collection<ChatRequestDoc>("chatRequests")
      .find({ receiverId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray(),
    db
      .collection<ChatRequestDoc>("chatRequests")
      .find({ senderId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray()
  ]);

  const usersMap = await getUsersMapByIds([
    ...incoming.map((request) => request.senderId),
    ...outgoing.map((request) => request.receiverId)
  ]);
  const postsMap = await getPostsMapByIds([
    ...incoming.map((request) => request.postId),
    ...outgoing.map((request) => request.postId)
  ]);

  return {
    incomingRequests: incoming.map((request) => ({
      ...serializeChatRequest(request),
      sender: (() => {
        const sender = usersMap.get(toId(request.senderId));

        return sender
          ? {
              name: sender.name,
              email: sender.email
            }
          : {
              name: "Unknown player",
              email: ""
            };
      })(),
      post: (() => {
        const post = postsMap.get(toId(request.postId));

        return post
          ? {
              sport: post.sport,
              locationName: post.locationName,
              datetime: post.datetime
            }
          : {
              sport: "",
              locationName: "",
              datetime: request.createdAt
            };
      })()
    })),
    outgoingRequests: outgoing.map((request) => ({
      ...serializeChatRequest(request),
      receiver: (() => {
        const receiver = usersMap.get(toId(request.receiverId));

        return receiver
          ? {
              name: receiver.name,
              email: receiver.email
            }
          : {
              name: "Unknown player",
              email: ""
            };
      })(),
      post: (() => {
        const post = postsMap.get(toId(request.postId));

        return post
          ? {
              sport: post.sport,
              locationName: post.locationName,
              datetime: post.datetime
            }
          : {
              sport: "",
              locationName: "",
              datetime: request.createdAt
            };
      })()
    }))
  };
}
