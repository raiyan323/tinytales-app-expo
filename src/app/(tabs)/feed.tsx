import { useFocusEffect, useRouter } from "expo-router";
import {
    BookOpen,
    CalendarDays,
    ChevronRight,
    Clock3,
    MessageCircle,
    Sparkles,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getStories,
    getStoryCommentCount,
    type Story,
} from "../../lib/appwrite";

const BG = "#100D20";
const CARD = "#1D1833";
const MUTED = "#AAA3C2";
const PURPLE = "#A78BFA";
const BORDER = "#332A4B";

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

function StoryCover({ story }: { story: Story }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = story.imageUrl?.trim();

  if (imageUrl && /^https?:\/\//i.test(imageUrl) && !imageFailed) {
    return (
      <Image
        source={{ uri: imageUrl }}
        resizeMode="cover"
        className="h-[230px] w-full"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View
      className="min-h-[210px] items-center justify-center overflow-hidden px-5 py-7"
      style={{ backgroundColor: story.color || "#30234F" }}
    >
      <View className="absolute -right-8 -top-9 h-36 w-36 rounded-full border border-black/10" />
      <View className="absolute -bottom-12 -left-7 h-36 w-36 rounded-full border border-black/10" />

      <View className="mb-4 h-[82px] w-[82px] items-center justify-center rounded-[26px] border border-white/20 bg-black/5">
        <Text className="text-[53px]">{story.emoji || "📖"}</Text>
      </View>

      <View className="rounded-full bg-black/10 px-3 py-1.5">
        <Text className="text-[10px] font-extrabold tracking-[1.5px] text-[#30213E]">
          TINyTALES STORY
        </Text>
      </View>

      <Text
        numberOfLines={3}
        className="mt-3 text-center text-[23px] font-black leading-8 text-[#30213E]"
      >
        {story.title || "A New Adventure"}
      </Text>
    </View>
  );
}

function PublishedTime({ date }: { date: string }) {
  return (
    <View className="mt-2 flex-row items-center">
      <Clock3 size={12} color={MUTED} />
      <Text className="ml-1.5 text-[10px]" style={{ color: MUTED }}>
        {formatPublishedAt(date)}
      </Text>
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStories = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

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
      console.error("Feed loading error:", err);
      setError("Couldn't load the story feed. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStories();
    }, [loadStories]),
  );

  const openStory = (id: string) => {
    router.push({
      pathname: "/details",
      params: { id },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
        <View>
          <View className="flex-row items-center">
            <Text className="text-[20px] font-black tracking-tight text-white">
              Tiny<Text style={{ color: PURPLE }}>Tales</Text>
            </Text>

            <View className="ml-2">
              <Sparkles size={17} color={PURPLE} />
            </View>
          </View>

          <Text className="mt-1 text-xs" style={{ color: MUTED }}>
            A new world on every page
          </Text>
        </View>

        {!loading && !error && stories.length > 0 && (
          <View
            className="flex-row items-center rounded-full px-3 py-2"
            style={{
              backgroundColor: "#30234F",
              borderWidth: 1,
              borderColor: "#453660",
            }}
          >
            <BookOpen size={13} color={PURPLE} />

            <Text className="ml-2 text-xs font-extrabold text-[#C4B5FD]">
              {stories.length} {stories.length === 1 ? "STORY" : "STORIES"}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >
        {/* Loading */}
        {loading ? (
          <View className="items-center justify-center py-14">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] bg-[#30234F]">
              <ActivityIndicator size="large" color={PURPLE} />
            </View>

            <Text className="mt-4 text-base font-extrabold text-white">
              Loading magical stories...
            </Text>

            <Text className="mt-2 text-sm" style={{ color: MUTED }}>
              Your next adventure is on its way.
            </Text>
          </View>
        ) : error ? (
          /* Error */
          <View
            className="rounded-[24px] border p-5"
            style={{
              backgroundColor: "#321D32",
              borderColor: "#633044",
            }}
          >
            <Text className="text-3xl">📚</Text>

            <Text className="mt-3 text-lg font-extrabold text-white">
              Couldnt open the feed
            </Text>

            <Text className="mt-2 text-sm leading-6 text-[#FDA4AF]">
              {error}
            </Text>

            <Pressable
              onPress={() => void loadStories()}
              className="mt-5 self-start rounded-xl bg-[#1D1833] px-5 py-3 active:opacity-70"
            >
              <Text className="font-extrabold text-white">Try again →</Text>
            </Pressable>
          </View>
        ) : stories.length === 0 ? (
          /* Empty State */
          <View
            className="items-center rounded-[26px] border px-6 py-10"
            style={{
              backgroundColor: CARD,
              borderColor: BORDER,
            }}
          >
            <View className="h-[86px] w-[86px] items-center justify-center rounded-[27px] bg-[#30234F]">
              <Text className="text-[43px]">🦄</Text>
            </View>

            <Text className="mt-5 text-xl font-black text-white">
              The feed is waiting!
            </Text>

            <Text
              className="mt-2 text-center text-sm leading-6"
              style={{ color: MUTED }}
            >
              Your next adventure will appear here when stories are added to
              your library.
            </Text>

            <Pressable
              onPress={() => void loadStories()}
              className="mt-5 rounded-xl bg-[#30234F] px-5 py-3 active:opacity-70"
            >
              <Text className="font-bold text-[#C4B5FD]">Refresh stories</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Story list */}
            {stories.map((story) => (
              <View
                key={story.$id}
                className="mb-5 overflow-hidden rounded-[26px] border"
                style={{
                  backgroundColor: CARD,
                  borderColor: BORDER,
                }}
              >
                {/* Author header */}
                <View className="flex-row items-center px-4 py-4">
                  <View className="h-[46px] w-[46px] items-center justify-center rounded-[16px] bg-[#30234F]">
                    <Text className="text-[23px]">✍️</Text>
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-extrabold text-white"
                    >
                      {story.writerName || "TinyTales Team"}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-1 text-xs"
                      style={{ color: MUTED }}
                    >
                      Storyteller · {story.category || "Adventure"}
                    </Text>

                    <PublishedTime date={story.$createdAt} />
                  </View>

                  <View className="rounded-full border border-[#403454] bg-[#30234F] p-2.5">
                    <Sparkles size={15} color={PURPLE} />
                  </View>
                </View>

                {/* Story Cover */}
                <Pressable
                  onPress={() => openStory(story.$id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${story.title}`}
                  className="mx-0 overflow-hidden  active:opacity-80"
                >
                  <StoryCover story={story} />
                </Pressable>

                {/* Story Details */}
                <View className="p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "#30234F" }}
                    >
                      <Text className="text-[10px] font-extrabold text-[#C4B5FD]">
                        {story.emoji || "📖"} {story.category || "Adventure"}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <CalendarDays size={12} color={MUTED} />
                      <Text
                        className="ml-1 text-[10px]"
                        style={{ color: MUTED }}
                      >
                        {new Date(story.$createdAt).toLocaleDateString(
                          "en-BD",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xl font-black leading-7 text-white">
                    {story.title || "A New Adventure"}
                  </Text>

                  <Text
                    numberOfLines={4}
                    className="mt-3 text-sm leading-[23px] text-[#D5CDE6]"
                  >
                    {story.story ||
                      "Open this story to discover a new adventure."}
                  </Text>

                  {/* Divider */}
                  <View
                    className="mt-5 h-px"
                    style={{ backgroundColor: "#403454" }}
                  />

                  {/* Actions */}
                  <View className="mt-4 flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center pr-2">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#30234F]">
                        <MessageCircle size={15} color={PURPLE} />
                      </View>

                      <View className="ml-2">
                        <Text className="text-sm font-extrabold text-white">
                          {commentCounts[story.$id] ?? 0}
                        </Text>

                        <Text className="text-[10px]" style={{ color: MUTED }}>
                          Comments
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => openStory(story.$id)}
                      accessibilityRole="button"
                      className="flex-row items-center rounded-[14px] bg-[#A78BFA] px-4 py-3 active:opacity-70"
                    >
                      <Text className="text-xs font-extrabold text-[#17102B]">
                        Read story
                      </Text>

                      <ChevronRight
                        size={16}
                        color="#17102B"
                        style={{ marginLeft: 3 }}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        {!loading && !error && stories.length > 0 && (
          <View className="items-center pb-3 pt-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#30234F]">
              <Sparkles size={19} color={PURPLE} />
            </View>

            <Text className="mt-3 text-sm font-extrabold text-white">
              Thats the magic of TinyTales
            </Text>

            <Text className="mt-1 text-xs" style={{ color: MUTED }}>
              Keep exploring, one story at a time.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
