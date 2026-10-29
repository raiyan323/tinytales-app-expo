import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowLeft } from "lucide-react-native";
import {
    addStoryComment,
    getStory,
    getStoryComments,
    Story,
    StoryComment,
} from "../lib/appwrite";

const BG = "#100D20";
const CARD = "#1D1833";
const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";
const BORDER = "#332A4B";

export default function DetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const [comments, setComments] = useState<StoryComment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load story
  useEffect(() => {
    let active = true;

    async function loadStory() {
      if (!id) {
        setError("We couldn't find this story.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setImageFailed(false);

      try {
        const data = await getStory(id);

        if (active) {
          setStory(data);
        }
      } catch (err) {
        console.error("Story loading error:", err);

        if (active) {
          setError("This story couldn't be opened. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStory();

    return () => {
      active = false;
    };
  }, [id]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!id) return;

    setCommentsLoading(true);

    try {
      const data = await getStoryComments(id);
      setComments(data);
    } catch (err) {
      console.error("Comments loading error:", err);

      Alert.alert(
        "Comments unavailable",
        "Couldn't load comments. Check your Appwrite permissions and try again.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadComments();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadComments]);
  // Submit comment
  const handleAddComment = async () => {
    const cleanName = commentName.trim();
    const cleanText = commentText.trim();

    if (!id) {
      Alert.alert("Error", "Story not found.");
      return;
    }

    if (!cleanName) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    if (cleanName.length > 40) {
      Alert.alert("Name too long", "Your name must be 40 characters or fewer.");
      return;
    }

    if (!cleanText) {
      Alert.alert("Empty comment", "Please write a comment first.");
      return;
    }

    if (cleanText.length > 1000) {
      Alert.alert(
        "Comment too long",
        "Your comment must be 1000 characters or fewer.",
      );
      return;
    }

    setSubmittingComment(true);

    try {
      const newComment = await addStoryComment(id, cleanText, cleanName);

      setComments((previous) => [newComment, ...previous]);
      setCommentText("");

      Alert.alert("Success", "Your comment has been added!");
    } catch (err) {
      console.error("Comment submission error:", err);

      Alert.alert(
        "Couldn't post comment",
        "Please check your connection and Appwrite permissions, then try again.",
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatCommentDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString();
  };

  const imageUrl = story?.imageUrl?.trim();
  const hasImage = Boolean(imageUrl) && !imageFailed;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "left", "right", "bottom"]}
      style={{ backgroundColor: BG }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {loading ? (
          <View className="items-center justify-center py-32">
            <ActivityIndicator size="large" color={PURPLE} />

            <Text className="mt-4" style={{ color: MUTED }}>
              Opening your magical story...
            </Text>
          </View>
        ) : error || !story ? (
          <View className="px-5 pt-6">
            <Pressable
              onPress={() => router.back()}
              className="mb-6 self-start rounded-full border px-4 py-3"
              style={{
                backgroundColor: CARD,
                borderColor: BORDER,
              }}
            >
              <Text className="font-bold text-[#C4B5FD]">← Go back</Text>
            </Pressable>

            <View
              className="items-center rounded-3xl p-7"
              style={{ backgroundColor: CARD }}
            >
              <Text className="text-5xl">📚</Text>

              <Text className="mt-4 text-center text-lg font-bold text-white">
                A little storybook problem
              </Text>

              <Text
                className="mt-2 text-center leading-6"
                style={{ color: MUTED }}
              >
                {error || "Story not found."}
              </Text>

              <Pressable
                onPress={() => router.back()}
                className="mt-5 rounded-xl px-5 py-3"
                style={{ backgroundColor: PURPLE }}
              >
                <Text className="font-bold text-[#17102B]">Go back</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Hero image: starts below the status bar */}
            <View
              className="relative w-full"
              style={{
                height: 430,
                backgroundColor: story.color || "#30234F",
              }}
            >
              {hasImage ? (
                <Image
                  source={{ uri: imageUrl }}
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
                  accessibilityLabel={`${story.title} cover`}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text style={{ fontSize: 110 }}>{story.emoji || "📖"}</Text>
                </View>
              )}

              {/* Cinematic fade */}
              <LinearGradient
                colors={[
                  "rgba(16,13,32,0.05)",
                  "rgba(16,13,32,0.12)",
                  "rgba(16,13,32,0.48)",
                  "rgba(16,13,32,0.85)",
                  BG,
                ]}
                locations={[0, 0.3, 0.55, 0.8, 1]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 280,
                }}
              />

              {/* Back button stays inside the safe area */}
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="absolute left-5 top-4 h-11 w-11 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(16,13,32,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  zIndex: 10,
                }}
              >
                <ArrowLeft size={21} color="#FFFFFF" />
              </Pressable>

              {/* Story title on the hero */}
              <View className="absolute bottom-0 left-0 right-0 px-5 pb-6">
                <View
                  className="self-start rounded-full border px-3 py-1.5"
                  style={{
                    backgroundColor: "rgba(167,139,250,0.3)",
                    borderColor: "rgba(196,181,253,0.8)",
                  }}
                >
                  <Text className="text-xs font-extrabold uppercase tracking-widest text-[#DDD0FF]">
                    {story.category || "STORY"}
                  </Text>
                </View>

                <Text className="mt-3 text-[34px] font-black leading-[41px] text-white">
                  {story.title}
                </Text>

                <View className="mt-3 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#39285A]">
                    <Text className="text-lg">✍️</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[10px] font-bold tracking-widest text-[#B8AECF]">
                      STORYTELLER
                    </Text>

                    <Text className="mt-1 font-bold text-white">
                      {story.writerName || "TinyTales Team"}
                    </Text>
                  </View>

                  <Text className="text-xl">🌟</Text>
                </View>
              </View>
            </View>

            {/* All content below the hero */}
            <View className="px-5">
              {/* Story */}
              <View className="mt-4">
                <View className="mb-4 flex-row items-center">
                  <View
                    className="mr-3 h-7 w-1 rounded-full"
                    style={{ backgroundColor: PURPLE }}
                  />

                  <Text className="text-xl font-extrabold text-white">
                    The Story
                  </Text>
                </View>

                <Text className="text-base leading-[31px] text-[#E5DDF8]">
                  {story.story}
                </Text>

                <View className="mt-8 items-center border-t border-[#403454] pt-6">
                  <Text className="text-3xl">🌙 ⭐ 🌙</Text>

                  <Text className="mt-3 text-xs font-extrabold tracking-[3px] text-[#C4B5FD]">
                    THE END
                  </Text>
                </View>
              </View>

              {/* Comments */}
              <View
                className="mt-8 rounded-[26px] border p-5"
                style={{
                  borderColor: BORDER,
                  backgroundColor: CARD,
                }}
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-xl font-extrabold text-white">
                    Comments 💬
                  </Text>

                  <View className="rounded-full bg-[#39285A] px-3 py-1">
                    <Text className="font-bold text-[#C4B5FD]">
                      {comments.length}
                    </Text>
                  </View>
                </View>

                <Text
                  className="mb-5 text-sm leading-6"
                  style={{ color: MUTED }}
                >
                  Share your thoughts about this story.
                </Text>

                <Text className="mb-2 font-semibold text-[#E5DDF8]">
                  Your name
                </Text>

                <TextInput
                  value={commentName}
                  onChangeText={setCommentName}
                  placeholder="Enter your name"
                  placeholderTextColor="#827995"
                  maxLength={40}
                  editable={!submittingComment}
                  autoCapitalize="words"
                  className="mb-4 rounded-2xl border p-4 text-base"
                  style={{
                    color: "#FFFFFF",
                    backgroundColor: BG,
                    borderColor: BORDER,
                  }}
                />

                <Text className="mb-2 font-semibold text-[#E5DDF8]">
                  Your comment
                </Text>

                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write a comment..."
                  placeholderTextColor="#827995"
                  multiline
                  maxLength={1000}
                  editable={!submittingComment}
                  textAlignVertical="top"
                  className="min-h-[110px] rounded-2xl border p-4 text-base"
                  style={{
                    color: "#FFFFFF",
                    backgroundColor: BG,
                    borderColor: BORDER,
                  }}
                />

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs" style={{ color: MUTED }}>
                    {commentText.length}/1000
                  </Text>

                  <Pressable
                    onPress={handleAddComment}
                    disabled={
                      submittingComment ||
                      !commentName.trim() ||
                      !commentText.trim()
                    }
                    className="rounded-xl px-5 py-3"
                    style={{
                      backgroundColor: PURPLE,
                      opacity:
                        submittingComment ||
                        !commentName.trim() ||
                        !commentText.trim()
                          ? 0.5
                          : 1,
                    }}
                  >
                    {submittingComment ? (
                      <ActivityIndicator color="#17102B" />
                    ) : (
                      <Text className="font-extrabold text-[#17102B]">
                        Post comment ✨
                      </Text>
                    )}
                  </Pressable>
                </View>

                <View className="mb-4 mt-6 border-t border-[#403454]" />

                {commentsLoading ? (
                  <View className="items-center py-6">
                    <ActivityIndicator color={PURPLE} />

                    <Text className="mt-3" style={{ color: MUTED }}>
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="items-center py-6">
                    <Text className="text-4xl">💭</Text>

                    <Text className="mt-3 font-bold text-white">
                      Be the first to comment!
                    </Text>

                    <Text
                      className="mt-1 text-center text-sm"
                      style={{ color: MUTED }}
                    >
                      Your thoughts can start the conversation.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {comments.map((comment) => (
                      <View
                        key={comment.$id}
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: BORDER,
                          backgroundColor: BG,
                        }}
                      >
                        <View className="mb-3 flex-row items-center">
                          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#39285A]">
                            <Text className="text-lg">👤</Text>
                          </View>

                          <View className="flex-1">
                            <Text className="font-bold text-[#C4B5FD]">
                              {comment.name || "Anonymous"}
                            </Text>

                            <Text
                              className="mt-1 text-xs"
                              style={{ color: MUTED }}
                            >
                              {formatCommentDate(comment.createdAt)}
                            </Text>
                          </View>
                        </View>

                        <Text className="text-base leading-6 text-[#E5DDF8]">
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Pressable
                onPress={() => router.back()}
                className="mt-6 items-center rounded-2xl p-4"
                style={{ backgroundColor: PURPLE }}
              >
                <Text className="font-extrabold text-[#17102B]">
                  Finished reading ✓
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
