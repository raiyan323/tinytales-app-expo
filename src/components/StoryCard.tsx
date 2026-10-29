import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getStoryCommentCount, type Story } from "../lib/appwrite";

export default function StoryCard({ story }: { story: Story }) {
  const router = useRouter();
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCommentCount() {
      try {
        const count = await getStoryCommentCount(story.$id);

        if (active) {
          setCommentCount(count);
        }
      } catch (error) {
        console.error("Failed to load comment count:", error);
      }
    }

    void loadCommentCount();

    return () => {
      active = false;
    };
  }, [story.$id]);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/details",
          params: { id: story.$id },
        })
      }
      className="mb-4 overflow-hidden rounded-[22px] border border-[#332A4B] bg-[#1D1833] active:opacity-80"
    >
      <View
        style={{ backgroundColor: story.color || "#30234F" }}
        className="items-center py-6"
      >
        <Text className="text-[54px]">{story.emoji || "📖"}</Text>
      </View>

      <View className="p-4">
        <Text className="text-xs font-bold text-[#C4B5FD]">
          {story.category}
        </Text>

        <Text className="mt-1 text-lg font-extrabold text-white">
          {story.title}
        </Text>

        <Text className="mt-1 text-sm text-[#AAA3C2]">
          Written by {story.writerName || "TinyTales Team"}
        </Text>

        <Text numberOfLines={3} className="mt-3 leading-6 text-[#D5CDE6]">
          {story.story}
        </Text>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="font-extrabold text-[#A78BFA]">
            Read full story →
          </Text>

          <View className="flex-row items-center rounded-full border border-[#453660] bg-[#30234F] px-3 py-2">
            <Text className="text-xs font-bold text-[#D9CCFF]">
              💬 {commentCount}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
