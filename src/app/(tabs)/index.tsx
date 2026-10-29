import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStories, getStoryCommentCount, Story } from "../../lib/appwrite";

const BG = "#100D20";
const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";

const categories = [
  { name: "All", emoji: "✨" },
  { name: "Animals", emoji: "🐻" },
  { name: "Fairy Tales", emoji: "🏰" },
  { name: "Adventure", emoji: "🚀" },
  { name: "Fantasy", emoji: "🦄" },
];

function StoryCover({
  imageUrl,
  emoji,
  color,
  featured = false,
}: {
  imageUrl?: string;
  emoji?: string;
  color?: string;
  featured?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const validImageUrl = imageUrl?.trim();

  if (validImageUrl && !imageFailed) {
    return (
      <Image
        source={{ uri: validImageUrl }}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
        className={
          featured ? "h-[220px] w-full" : "h-[82px] w-[82px] rounded-[18px]"
        }
      />
    );
  }

  return (
    <View
      className={
        featured
          ? "w-full items-center justify-center py-7"
          : "h-[82px] w-[82px] items-center justify-center rounded-[18px]"
      }
      style={{ backgroundColor: color || "#30234F" }}
    >
      <Text style={{ fontSize: featured ? 78 : 42 }}>{emoji || "📖"}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;

    async function loadStories() {
      try {
        setLoading(true);
        setError("");

        const data = await getStories();

        if (!active) return;

        setStories(data);

        const entries = await Promise.all(
          data.map(async (story) => {
            try {
              const count = await getStoryCommentCount(story.$id);
              return [story.$id, count] as const;
            } catch (err) {
              console.error(`Comment count error for ${story.$id}:`, err);
              return [story.$id, 0] as const;
            }
          }),
        );

        if (active) {
          setCommentCounts(Object.fromEntries(entries));
        }
      } catch (err) {
        console.error("Appwrite error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't load your magical stories.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStories();

    return () => {
      active = false;
    };
  }, []);

  const openStory = (id: string) => {
    router.push({
      pathname: "/details",
      params: { id },
    });
  };

  const featuredStory = stories[0];

  const filteredStories =
    selectedCategory === "All"
      ? stories
      : stories.filter((story) => story.category === selectedCategory);

  const visibleStories = filteredStories.filter(
    (story) => selectedCategory !== "All" || story.$id !== featuredStory?.$id,
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Top navigation */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-3">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#30234F]">
            <Image
              source={require("../../../assets/images/icon.png")}
              className="h-12 w-12"
              resizeMode="contain"
            />
          </View>

          <View>
            <Text className="text-xl font-black text-white">TinyTales</Text>
            <Text className="text-xs" style={{ color: MUTED }}>
              YOUR MAGICAL LIBRARY
            </Text>
          </View>
        </View>

        <View className="rounded-full border border-[#453660] bg-[#211A38] px-3 py-2">
          <Text className="text-sm font-bold text-[#FCD34D]">
            Let&apos;s read!
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {/* Welcome hero */}
        <View className="mx-5 mt-4 overflow-hidden rounded-[30px] bg-[#281B48] p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-[#C4B5FD]">
                ✨ A LITTLE MAGIC EVERY DAY
              </Text>

              <Text className="mt-3 text-[30px] font-black leading-[36px] text-white">
                Dream big,{"\n"}little reader!
              </Text>

              <Text className="mt-3 text-sm leading-6 text-[#D0C5E9]">
                Wonderful worlds and new friends are waiting for you.
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-[64px]">🪄</Text>
              <Text className="text-2xl">⭐ 🌙</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/search")}
            className="mt-5 self-start rounded-2xl bg-[#A78BFA] px-5 py-3 active:opacity-70"
          >
            <Text className="font-extrabold text-[#17102B]">
              Find a story →
            </Text>
          </Pressable>

          <View className="absolute right-4 top-3">
            <Text className="text-xl text-[#FDE68A]">✦</Text>
          </View>
        </View>

        {/* Categories */}
        <View className="mt-7">
          <View className="mb-4 flex-row items-center justify-between px-5">
            <Text className="text-xl font-extrabold text-white">
              Explore worlds 🌈
            </Text>
            <Text className="text-xs font-bold text-[#C2C9F0]">PICK ONE</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 5,
              gap: 12,
            }}
          >
            {categories.map((category) => {
              const active = selectedCategory === category.name;

              return (
                <Pressable
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.name} category`}
                  accessibilityState={{ selected: active }}
                  className="items-center active:opacity-80"
                  style={{ width: 82 }}
                >
                  <View
                    className="h-[68px] w-[68px] items-center justify-center rounded-[22px] border"
                    style={{
                      backgroundColor: active ? "#302653" : "#1D1833",
                      borderColor: active ? PURPLE : "#332A4B",
                      borderWidth: active ? 1.8 : 1,
                      transform: [{ scale: active ? 1.04 : 1 }],
                      elevation: active ? 4 : 1,
                      shadowColor: PURPLE,
                      shadowOpacity: active ? 0.2 : 0,
                      shadowRadius: active ? 8 : 0,
                      shadowOffset: { width: 0, height: 3 },
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>{category.emoji}</Text>

                    {active && (
                      <View
                        className="absolute -right-1 -top-1 h-[21px] w-[21px] items-center justify-center rounded-full border-2"
                        style={{
                          backgroundColor: PURPLE,
                          borderColor: BG,
                        }}
                      >
                        <Text className="text-[11px] font-black text-[#100D20]">
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    numberOfLines={1}
                    className="mt-3 text-center text-xs font-bold"
                    style={{
                      color: active ? "#C4B5FD" : MUTED,
                      maxWidth: 82,
                    }}
                  >
                    {category.name}
                  </Text>

                  <View
                    className="mt-2 h-1 rounded-full"
                    style={{
                      width: active ? 22 : 0,
                      backgroundColor: PURPLE,
                    }}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Featured story */}
        {featuredStory && selectedCategory === "All" && (
          <View className="mt-8 px-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-extrabold text-white">
                Story of the day ⭐
              </Text>
              <Text className="text-xs font-bold text-[#FCD34D]">FEATURED</Text>
            </View>

            <Pressable
              onPress={() => openStory(featuredStory.$id)}
              className="overflow-hidden rounded-[26px] border border-[#42355D] bg-[#211A38] active:opacity-80"
            >
              <View className="overflow-hidden">
                <StoryCover
                  imageUrl={featuredStory.imageUrl}
                  emoji={featuredStory.emoji}
                  color={featuredStory.color}
                  featured
                />

                <View className="absolute bottom-3 left-3 rounded-full bg-black/60 px-4 py-2">
                  <Text className="font-bold text-white">
                    {featuredStory.category}
                  </Text>
                </View>
              </View>

              <View className="p-5">
                <Text className="text-2xl font-black text-white">
                  {featuredStory.title}
                </Text>

                <Text className="mt-2 text-sm text-[#BEB4D6]">
                  Written by {featuredStory.writerName}
                </Text>

                <Text
                  numberOfLines={2}
                  className="mt-3 text-sm leading-6 text-[#C5BCD9]"
                >
                  {featuredStory.story}
                </Text>

                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="font-extrabold text-[#C4B5FD]">
                    Start reading →
                  </Text>

                  <View className="rounded-full border border-[#453660] bg-[#30234F] px-3 py-2">
                    <Text className="text-xs font-bold text-[#D9CCFF]">
                      💬 {commentCounts[featuredStory.$id] ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Stories list */}
        <View className="mt-8 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-white">
              {selectedCategory === "All"
                ? "More adventures 📚"
                : selectedCategory}
            </Text>

            <Text className="text-sm" style={{ color: MUTED }}>
              {visibleStories.length +
                (selectedCategory === "All" && featuredStory ? 1 : 0)}{" "}
              stories
            </Text>
          </View>

          {/* Loading */}
          {loading && (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={PURPLE} />
              <Text className="mt-3" style={{ color: MUTED }}>
                Finding your stories...
              </Text>
            </View>
          )}

          {/* Error */}
          {!!error && (
            <View className="rounded-2xl border border-[#63364D] bg-[#321D32] p-4">
              <Text className="font-bold text-[#FDA4AF]">
                Oops! Something went wrong.
              </Text>

              <Text className="mt-2 leading-5 text-[#FBCFE8]">{error}</Text>

              <Pressable
                onPress={() => router.replace("/")}
                className="mt-4 self-start rounded-xl bg-[#A78BFA] px-4 py-2"
              >
                <Text className="font-bold text-[#17102B]">Return home</Text>
              </Pressable>
            </View>
          )}

          {/* Empty state */}
          {!loading &&
            !error &&
            visibleStories.length === 0 &&
            !(selectedCategory === "All" && featuredStory) && (
              <View className="items-center rounded-3xl bg-[#1D1833] p-7">
                <Text className="text-5xl">🔭</Text>

                <Text className="mt-3 text-center text-lg font-bold text-white">
                  No stories in this world yet
                </Text>

                <Text className="mt-2 text-center leading-6 text-[#AAA3C2]">
                  Choose another category to discover more adventures.
                </Text>
              </View>
            )}

          {/* Story cards */}
          {!loading &&
            !error &&
            visibleStories.map((story) => (
              <Pressable
                key={story.$id}
                onPress={() => openStory(story.$id)}
                className="mb-3 flex-row items-center rounded-[22px] border border-[#332A4B] bg-[#1D1833] p-3 active:opacity-70"
              >
                <StoryCover
                  imageUrl={story.imageUrl}
                  emoji={story.emoji}
                  color={story.color}
                />

                <View className="ml-3 flex-1 py-1">
                  <Text className="text-xs font-bold text-[#C4B5FD]">
                    {story.category}
                  </Text>

                  <Text
                    numberOfLines={2}
                    className="mt-1 text-base font-extrabold text-white"
                  >
                    {story.title}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="mt-1 text-xs"
                    style={{ color: MUTED }}
                  >
                    By {story.writerName}
                  </Text>

                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-[#A78BFA]">
                      Read story →
                    </Text>

                    <Text className="text-xs text-[#C4B5D9]">
                      💬 {commentCounts[story.$id] ?? 0}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
        </View>

        {/* Footer */}
        <View className="mx-5 mt-6 items-center rounded-2xl p-5">
          <Text className="text-3xl">🌙</Text>

          <Text className="mt-2 font-extrabold text-white">
            Every story is a new adventure
          </Text>

          <Text className="mt-1 text-center text-sm" style={{ color: MUTED }}>
            Keep imagining. Keep exploring. Keep reading.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
