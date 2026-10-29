import { useFocusEffect, useRouter } from "expo-router";
import { BookOpen, Search, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStories, Story } from "../../lib/appwrite";

const BG = "#100D20";
const CARD = "#1D1833";
const MUTED = "#AAA3C2";
const PURPLE = "#A78BFA";
const BORDER = "#332A4B";

function StoryArtwork({
  imageUrl,
  emoji,
  color,
}: {
  imageUrl?: string;
  emoji?: string;
  color?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const url = imageUrl?.trim();

  if (url && !imageFailed) {
    return (
      <Image
        source={{ uri: url }}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
        className="h-[104px] w-[100px] rounded-[18px]"
        accessibilityLabel="Story cover"
      />
    );
  }

  return (
    <View
      className="h-[104px] w-[100px] items-center justify-center overflow-hidden rounded-[18px]"
      style={{ backgroundColor: color || "#30234F" }}
    >
      <View className="absolute -right-4 -top-5 h-16 w-16 rounded-full bg-white/10" />
      <View className="absolute -bottom-5 -left-3 h-14 w-14 rounded-full bg-black/10" />
      <Text className="text-[43px]">{emoji || "📖"}</Text>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStories();
      setStories(data);
    } catch (err) {
      console.error("Search loading error:", err);
      setError("Couldn't load the library. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStories();
    }, [loadStories]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return stories.filter(
      (story) =>
        (story.title || "").toLowerCase().includes(q) ||
        (story.category || "").toLowerCase().includes(q) ||
        (story.writerName || "").toLowerCase().includes(q),
    );
  }, [query, stories]);

  const openStory = (id: string) => {
    router.push({
      pathname: "/details",
      params: { id },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[32px] font-black tracking-tight text-white">
                Explore stories
              </Text>

              <Text className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                Little stories, big adventures.
              </Text>
            </View>

            <View className="ml-3 h-[58px] w-[58px] items-center justify-center rounded-[20px] border border-[#403454] bg-[#1D1833]">
              <BookOpen size={27} color={PURPLE} />
            </View>
          </View>

          {/* Search input */}
          <View
            className="flex-row items-center rounded-[20px] border px-4"
            style={{
              minHeight: 62,
              backgroundColor: CARD,
              borderColor: query ? PURPLE : "#403454",
            }}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#30234F]">
              <Search size={20} color={PURPLE} />
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find a magical story..."
              placeholderTextColor="#8E85A7"
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search stories, categories, and writers"
              className="flex-1 py-4 text-[15px] text-white"
            />

            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                accessibilityLabel="Clear search"
                hitSlop={10}
                className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-[#30234F]"
              >
                <X size={17} color={MUTED} />
              </Pressable>
            )}
          </View>

          {/* Results heading */}
          {!loading && !error && (
            <View className="mb-4 mt-7 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-black text-white">
                  {query.trim() ? "Search results" : "Story library"}
                </Text>

                <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                  {query.trim()
                    ? "Your next adventure awaits"
                    : "Pick a story and start exploring"}
                </Text>
              </View>

              <View className="rounded-full border border-[#403454] bg-[#1D1833] px-3 py-2">
                <Text className="text-xs font-extrabold text-[#C4B5FD]">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "STORY" : "STORIES"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Loading */}
        {loading ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-[76px] w-[76px] items-center justify-center rounded-[26px] border border-[#403454] bg-[#1D1833]">
              <ActivityIndicator color={PURPLE} size="large" />
            </View>

            <Text className="mt-5 text-base font-bold text-white">
              Opening the storybook...
            </Text>

            <Text className="mt-2 text-center text-sm" style={{ color: MUTED }}>
              Getting your next adventure ready.
            </Text>
          </View>
        ) : error ? (
          <View className="mx-5 mt-6 rounded-[24px] border border-[#633044] bg-[#321D32] p-6">
            <Text className="text-3xl">📚</Text>

            <Text className="mt-3 text-lg font-extrabold text-white">
              Something went wrong
            </Text>

            <Text className="mt-2 leading-6 text-[#FDA4AF]">{error}</Text>

            <Pressable
              onPress={() => void loadStories()}
              className="mt-5 self-start rounded-[14px] bg-[#1D1833] px-5 py-3 active:opacity-70"
            >
              <Text className="font-bold text-white">Try again →</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 35,
            }}
          >
            {filtered.map((story) => (
              <Pressable
                key={story.$id}
                onPress={() => openStory(story.$id)}
                accessibilityRole="button"
                accessibilityLabel={`Read ${story.title}`}
                className="mb-4 overflow-hidden rounded-[24px] border bg-[#1D1833] active:opacity-75"
                style={{ borderColor: BORDER }}
              >
                <View className="flex-row items-center p-3">
                  {/* Story artwork: image or emoji fallback */}
                  <StoryArtwork
                    imageUrl={story.imageUrl}
                    emoji={story.emoji}
                    color={story.color}
                  />

                  {/* Story information */}
                  <View className="ml-4 flex-1 justify-center py-1">
                    <View className="self-start rounded-full bg-[#30234F] px-2.5 py-1">
                      <Text className="text-[10px] font-extrabold tracking-wide text-[#C4B5FD]">
                        {story.category || "STORY"}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={2}
                      className="mt-2 text-[16px] font-extrabold leading-[22px] text-white"
                    >
                      {story.title || "Untitled Story"}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-1.5 text-xs"
                      style={{ color: MUTED }}
                    >
                      By {story.writerName || "TinyTales Team"}
                    </Text>

                    <View className="mt-3 flex-row items-center">
                      <Text className="text-xs font-extrabold text-[#A78BFA]">
                        Read story
                      </Text>

                      <Text className="ml-1 text-sm font-bold text-[#A78BFA]">
                        →
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}

            {/* Empty state */}
            {filtered.length === 0 && (
              <View className="mt-5 items-center rounded-[28px] border border-[#332A4B] bg-[#1D1833] px-6 py-10">
                <View className="h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-[#30234F]">
                  <Search size={36} color={PURPLE} />
                </View>

                <Text className="mt-5 text-xl font-black text-white">
                  No stories found
                </Text>

                <Text
                  className="mt-2 max-w-[260px] text-center text-sm leading-6"
                  style={{ color: MUTED }}
                >
                  {query.trim()
                    ? "We couldn't find a match. Try a different title, category, or writer."
                    : "Your story library is waiting for its first adventure."}
                </Text>

                {query.length > 0 && (
                  <Pressable
                    onPress={() => setQuery("")}
                    className="mt-5 rounded-[15px] bg-[#A78BFA] px-6 py-3.5 active:opacity-75"
                  >
                    <Text className="font-extrabold text-[#17102B]">
                      Show all stories
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
