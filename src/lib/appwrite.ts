import { Client, Databases, ID, Query } from "react-native-appwrite";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

export const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

export const collectionId = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const commentsCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!;

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const databases = new Databases(client);

// Story type
export type Story = {
  $id: string;
  title: string;
  category: string;
  emoji: string;
  color: string;
  imageUrl?: string;
  writerName: string;
  story: string;
  $createdAt: string;
};

// Comment type
export type StoryComment = {
  $id: string;
  storyId: string;
  name: string;
  text: string;
  createdAt: string;
};

// for create stories

export async function createStory(data: {
  title: string;
  category: string;
  emoji: string;
  color: string;
  writerName: string;
  story: string;
}) {
  return databases.createDocument({
    databaseId,
    collectionId: collectionId,
    documentId: ID.unique(),
    data,
  });
}

export async function getStoryCommentCount(storyId: string): Promise<number> {
  const result = await databases.listDocuments({
    databaseId,
    collectionId: commentsCollectionId,
    queries: [Query.equal("storyId", storyId), Query.limit(1)],
  });

  return result.total;
}

// Get all stories
export async function getStories(): Promise<Story[]> {
  const result = await databases.listDocuments({
    databaseId,
    collectionId,
    queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
  });

  return result.documents as unknown as Story[];
}

// Get one story
export async function getStory(id: string): Promise<Story> {
  const result = await databases.getDocument({
    databaseId,
    collectionId,
    documentId: id,
  });

  return result as unknown as Story;
}

// Get comments for a story
export async function getStoryComments(
  storyId: string,
): Promise<StoryComment[]> {
  const result = await databases.listDocuments({
    databaseId,
    collectionId: commentsCollectionId,
    queries: [
      Query.equal("storyId", storyId),
      Query.orderDesc("createdAt"),
      Query.limit(100),
    ],
  });

  return result.documents as unknown as StoryComment[];
}

// Add a comment
export async function addStoryComment(
  storyId: string,
  text: string,
  name: string,
): Promise<StoryComment> {
  const cleanName = name.trim();
  const cleanText = text.trim();

  if (!cleanName || cleanName.length > 40) {
    throw new Error("Name must be between 1 and 40 characters.");
  }

  if (!cleanText || cleanText.length > 1000) {
    throw new Error("Comment must be between 1 and 1000 characters.");
  }

  const result = await databases.createDocument({
    databaseId,
    collectionId: commentsCollectionId,
    documentId: ID.unique(),
    data: {
      storyId,
      name: cleanName,
      text: cleanText,
      createdAt: new Date().toISOString(),
    },
  });

  return result as unknown as StoryComment;
}
