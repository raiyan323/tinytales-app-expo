import { useRouter } from "expo-router";
import { Clock, RefreshCw } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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
const CARD = "#1D1833";
const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";
const BORDER = "#332A4B";

const categories = [
  { name: "All", emoji: "✨" },
  { name: "Animals", emoji: "🐻" },
  { name: "Fairy Tales", emoji: "🏰" },
  { name: "Adventure", emoji: "🚀" },
  { name: "Fantasy", emoji: "🦄" },
];

type HomeView = "all" | "top";

function formatPublishedAt(date: string) {
  const publishedDate = new Date(date);

  if (Number.isNaN(publishedDate.getTime())) {
    return "Unknown date";
  }

  return publishedDate.toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

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

  const [activeView, setActiveView] = useState<HomeView>("all");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Load stories and comment counts
  const loadStories = useCallback(async () => {
    try {
      setError("");

      const data = await getStories();
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

      setCommentCounts(Object.fromEntries(entries));
    } catch (err) {
      console.error("Appwrite error:", err);

      setError(
        err instanceof Error ? err.message : "We couldn't load your stories.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStories();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadStories]);

  // Refresh button
  const handleRefresh = () => {
    if (loading || refreshing) return;

    setRefreshing(true);
    void loadStories();
  };

  // Open story details
  const openStory = (id: string) => {
    router.push({
      pathname: "/details",
      params: { id },
    });
  };

  // Featured story
  const featuredStory = stories[0];

  // Category filtering
  const filteredStories =
    selectedCategory === "All"
      ? stories
      : stories.filter((story) => story.category === selectedCategory);

  // Top 10 most-commented stories
  const topStories = [...stories]
    .sort((a, b) => {
      const countDifference =
        (commentCounts[b.$id] ?? 0) - (commentCounts[a.$id] ?? 0);

      if (countDifference !== 0) {
        return countDifference;
      }

      // If comments are equal, newest story comes first
      return (
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );
    })
    .slice(0, 10);

  // Show all stories or top 10
  const visibleStories = activeView === "top" ? topStories : filteredStories;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
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
            <Text className="text-[17px] font-black tracking-tight text-white">
              Tiny<Text style={{ color: PURPLE }}>Tales</Text>
            </Text>

            <Text className="text-xs" style={{ color: MUTED }}>
              YOUR MAGICAL World
            </Text>
          </View>
        </View>

        {/* Refresh */}
        <Pressable
          onPress={handleRefresh}
          disabled={loading || refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh stories"
          className="h-11 w-11 items-center justify-center rounded-2xl border border-[#453660] bg-[#211A38] active:opacity-70"
          style={{ opacity: loading || refreshing ? 0.5 : 1 }}
        >
          <RefreshCw size={20} color={PURPLE} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {/* View Selector */}
        <View className="mx-5 mt-5 flex-row rounded-2xl border border-[#332A4B] bg-[#1D1833] p-1.5">
          <Pressable
            onPress={() => setActiveView("all")}
            className="flex-1 items-center rounded-xl py-3"
            style={{
              backgroundColor: activeView === "all" ? "#382957" : "transparent",
            }}
          >
            <Text
              className="font-extrabold"
              style={{
                color: activeView === "all" ? "#D8C8FF" : MUTED,
              }}
            >
              📚 All Stories
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveView("top")}
            className="flex-1 items-center rounded-xl py-3"
            style={{
              backgroundColor: activeView === "top" ? "#382957" : "transparent",
            }}
          >
            <Text
              className="font-extrabold"
              style={{
                color: activeView === "top" ? "#D8C8FF" : MUTED,
              }}
            >
              🏆 Top Stories
            </Text>
          </Pressable>
        </View>

        {/* All Stories View */}
        {activeView === "all" && (
          <>
            {/* Categories */}
            <View className="mt-7">
              <View className="mb-4 flex-row items-center justify-between px-5">
                <Text className="text-xl font-extrabold text-white">
                  Explore worlds 🌈
                </Text>

                <Text className="text-xs font-bold text-[#C2C9F0]">
                  PICK ONE
                </Text>
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
                      className="items-center active:opacity-80"
                      style={{ width: 82 }}
                    >
                      <View
                        className="h-[68px] w-[68px] items-center justify-center rounded-[22px] border"
                        style={{
                          backgroundColor: active ? "#302653" : CARD,
                          borderColor: active ? PURPLE : BORDER,
                          borderWidth: active ? 1.8 : 1,
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

            {/* Featured Story */}
            {featuredStory && selectedCategory === "All" && (
              <View className="mt-8 px-5">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-xl font-extrabold text-white">
                    Story of the day ⭐
                  </Text>

                  <Text className="text-xs font-bold text-[#FCD34D]">
                    FEATURED
                  </Text>
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
                    <View className="mt-2 flex-row items-center">
                      <Text className="text-xs" style={{ color: MUTED }}>
                        <Clock color={"#AAA3C2"} size={10} />{" "}
                        {formatPublishedAt(featuredStory.$createdAt)}
                      </Text>
                    </View>

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
          </>
        )}

        {/* Top Stories Heading */}
        {activeView === "top" && (
          <View className="mt-7 px-5">
            <Text className="text-2xl font-black text-white">
              Top 10 Stories 🏆
            </Text>

            <Text className="mt-2 text-sm leading-5" style={{ color: MUTED }}>
              The most discussed stories in the TinyTales community.
            </Text>
          </View>
        )}

        {/* Story List */}
        <View className="mt-8 px-5">
          {activeView === "all" && (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-extrabold text-white">
                {selectedCategory === "All"
                  ? "More adventures 📚"
                  : selectedCategory}
              </Text>

              <Text className="text-sm" style={{ color: MUTED }}>
                {visibleStories.length} stories
              </Text>
            </View>
          )}

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
          {!!error && !loading && (
            <View className="rounded-2xl border border-[#63364D] bg-[#321D32] p-4">
              <Text className="font-bold text-[#FDA4AF]">
                Oops! Something went wrong.
              </Text>

              <Text className="mt-2 leading-5 text-[#FBCFE8]">{error}</Text>

              <Pressable
                onPress={handleRefresh}
                className="mt-4 self-start rounded-xl bg-[#A78BFA] px-4 py-2"
              >
                <Text className="font-bold text-[#17102B]">Try again</Text>
              </Pressable>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && visibleStories.length === 0 && (
            <View className="items-center rounded-3xl bg-[#1D1833] p-7">
              <Text className="text-5xl">
                {activeView === "top" ? "🏆" : "🔭"}
              </Text>

              <Text className="mt-3 text-center text-lg font-bold text-white">
                {activeView === "top"
                  ? "No top stories yet"
                  : "No stories in this world yet"}
              </Text>

              <Text
                className="mt-2 text-center leading-6"
                style={{ color: MUTED }}
              >
                {activeView === "top"
                  ? "Stories will appear here as readers start commenting."
                  : "Choose another category to discover more adventures."}
              </Text>
            </View>
          )}

          {/* Top 10 / All Story Cards */}
          {!loading &&
            !error &&
            visibleStories.map((story, index) => {
              const isTop = activeView === "top";

              return (
                <Pressable
                  key={story.$id}
                  onPress={() => openStory(story.$id)}
                  className="mb-3 flex-row items-center rounded-[22px] border p-3 active:opacity-70"
                  style={{
                    backgroundColor: CARD,
                    borderColor: isTop && index === 0 ? "#66502F" : BORDER,
                  }}
                >
                  {/* Top 10 Ranking */}
                  {isTop && (
                    <View
                      className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: index === 0 ? "#49351F" : "#30234F",
                      }}
                    >
                      <Text
                        className="text-sm font-black"
                        style={{
                          color: index === 0 ? "#FCD34D" : PURPLE,
                        }}
                      >
                        #{index + 1}
                      </Text>
                    </View>
                  )}

                  {/* Cover */}
                  <StoryCover
                    imageUrl={story.imageUrl}
                    emoji={story.emoji}
                    color={story.color}
                  />

                  {/* Story Details */}
                  <View className="ml-3 flex-1 py-1">
                    <Text
                      numberOfLines={1}
                      className="text-xs font-bold"
                      style={{ color: PURPLE }}
                    >
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

                    <View className="mt-1 flex-row items-center">
                      <Text className="text-[10px]" style={{ color: MUTED }}>
                        <Clock color={"#AAA3C2"} size={9} />{" "}
                        {formatPublishedAt(story.$createdAt)}
                      </Text>
                    </View>

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
              );
            })}
        </View>

        {/* Footer */}
        {!loading && !error && (
          <View className="mx-5 mt-6 items-center rounded-2xl p-5">
            <Text className="text-3xl">🌙</Text>

            <Text className="mt-2 font-extrabold text-white">
              Every story is a new adventure
            </Text>

            <Text className="mt-1 text-center text-sm" style={{ color: MUTED }}>
              Keep imagining. Keep exploring. Keep reading.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
