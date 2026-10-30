import { useFocusEffect, useRouter } from "expo-router";
import {
    ArrowUpRight,
    BookOpen,
    RefreshCw,
    Search,
    X,
} from "lucide-react-native";
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
        className="h-[108px] w-[100px] rounded-2xl"
        accessibilityLabel="Story cover"
      />
    );
  }

  return (
    <View
      className="h-[108px] w-[100px] items-center justify-center overflow-hidden rounded-2xl"
      style={{ backgroundColor: color || "#30234F" }}
    >
      <View className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10" />
      <View className="absolute -bottom-5 -left-4 h-16 w-16 rounded-full bg-black/10" />
      <Text className="text-[42px]">{emoji || "📖"}</Text>
    </View>
  );
}

function formatPublishedAt(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
      let active = true;

      const fetchStories = async () => {
        try {
          setLoading(true);
          setError("");

          const data = await getStories();

          if (active) setStories(data);
        } catch (err) {
          console.error("Search loading error:", err);

          if (active) {
            setError("Couldn't load the library. Please try again.");
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      void fetchStories();

      return () => {
        active = false;
      };
    }, []),
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
        {/* FIXED HEADER */}
        <View className="px-5 pb-4 pt-4" style={{ backgroundColor: BG }}>
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[10px] font-extrabold tracking-[2px] text-[#A78BFA]">
                TINYTALES LIBRARY
              </Text>

              <Text className="mt-2 text-[30px] font-black tracking-tight text-white">
                Explore stories
              </Text>

              <Text className="mt-1 text-sm" style={{ color: MUTED }}>
                Find your next adventure.
              </Text>
            </View>

            <View
              className="ml-3 h-[54px] w-[54px] items-center justify-center rounded-[19px] border"
              style={{ backgroundColor: CARD, borderColor: BORDER }}
            >
              <BookOpen size={25} color={PURPLE} />
            </View>
          </View>

          {/* FIXED SEARCH BAR */}
          <View
            className="flex-row items-center rounded-2xl border px-4"
            style={{
              minHeight: 58,
              backgroundColor: CARD,
              borderColor: query ? PURPLE : BORDER,
            }}
          >
            <Search size={20} color={PURPLE} />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search stories, categories..."
              placeholderTextColor="#8E85A7"
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search stories"
              className="ml-3 flex-1 py-4 text-sm text-white"
            />

            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                accessibilityLabel="Clear search"
                hitSlop={10}
                className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-[#30234F]"
              >
                <X size={16} color={MUTED} />
              </Pressable>
            )}
          </View>

          {/* RESULTS HEADER */}
          {!loading && !error && (
            <View className="mt-6 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-extrabold text-white">
                  {query.trim() ? "Search results" : "All stories"}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                  {query.trim()
                    ? "Stories matching your search"
                    : "Explore the collection"}
                </Text>
              </View>

              <View
                className="rounded-full border px-3 py-2"
                style={{ backgroundColor: CARD, borderColor: BORDER }}
              >
                <Text className="text-[10px] font-extrabold text-[#C4B5FD]">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "STORY" : "STORIES"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* SCROLLABLE CONTENT ONLY */}
        {loading ? (
          <View className="flex-1 items-center justify-center px-8">
            <View
              className="h-16 w-16 items-center justify-center rounded-2xl border"
              style={{ backgroundColor: CARD, borderColor: BORDER }}
            >
              <ActivityIndicator color={PURPLE} size="large" />
            </View>

            <Text className="mt-5 font-bold text-white">
              Loading stories...
            </Text>
            <Text className="mt-2 text-sm" style={{ color: MUTED }}>
              Preparing your story collection.
            </Text>
          </View>
        ) : error ? (
          <View
            className="mx-5 mt-5 rounded-3xl border p-6"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            <Text className="text-3xl">📚</Text>
            <Text className="mt-4 text-lg font-extrabold text-white">
              Something went wrong
            </Text>
            <Text className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
              {error}
            </Text>

            <Pressable
              onPress={() => void loadStories()}
              className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-xl"
              style={{ backgroundColor: "#30234F" }}
            >
              <RefreshCw size={16} color={PURPLE} />
              <Text className="font-bold text-white">Try again</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: 35,
            }}
          >
            {filtered.map((story) => (
              <Pressable
                key={story.$id}
                onPress={() => openStory(story.$id)}
                accessibilityRole="button"
                accessibilityLabel={`Read ${story.title}`}
                className="mb-3 overflow-hidden rounded-[22px] border active:opacity-75"
                style={{
                  backgroundColor: CARD,
                  borderColor: BORDER,
                }}
              >
                <View className="flex-row items-center p-3">
                  <StoryArtwork
                    imageUrl={story.imageUrl}
                    emoji={story.emoji}
                    color={story.color}
                  />

                  <View className="ml-4 flex-1 justify-center py-1">
                    <View
                      className="self-start rounded-full px-2.5 py-1"
                      style={{ backgroundColor: "#30234F" }}
                    >
                      <Text className="text-[10px] font-extrabold tracking-wide text-[#C4B5FD]">
                        {story.category || "STORY"}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={2}
                      className="mt-2 text-[15px] font-extrabold leading-[21px] text-white"
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

                    <View className="mt-3 flex-row items-center justify-between">
                      <Text
                        className="text-[10px]"
                        style={{ color: "#8E85A7" }}
                      >
                        {formatPublishedAt(story.$createdAt)}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-[#A78BFA]">
                          Read
                        </Text>
                        <ArrowUpRight
                          size={15}
                          color={PURPLE}
                          style={{ marginLeft: 3 }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}

            {filtered.length === 0 && (
              <View
                className="mt-3 items-center rounded-[26px] border px-6 py-10"
                style={{ backgroundColor: CARD, borderColor: BORDER }}
              >
                <View
                  className="h-[76px] w-[76px] items-center justify-center rounded-3xl"
                  style={{ backgroundColor: "#30234F" }}
                >
                  <Search size={32} color={PURPLE} />
                </View>

                <Text className="mt-5 text-xl font-extrabold text-white">
                  No stories found
                </Text>

                <Text
                  className="mt-2 max-w-[260px] text-center text-sm leading-6"
                  style={{ color: MUTED }}
                >
                  {query.trim()
                    ? "Try another title, category, or writer."
                    : "Your story library is waiting for its first adventure."}
                </Text>

                {query.length > 0 && (
                  <Pressable
                    onPress={() => setQuery("")}
                    className="mt-5 rounded-xl px-6 py-3"
                    style={{ backgroundColor: PURPLE }}
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
