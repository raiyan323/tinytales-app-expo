import { useState } from "react";

import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    EllipsisVertical,
    Pencil,
    Sparkles,
    Trash2,
    X,
} from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { deleteStory, type Story, updateStory } from "../lib/appwrite";

// Theme
const BG = "#100D20";
const CARD = "#1D1833";
const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";
const BORDER = "#332A4B";

const categories = [
  "Animals",
  "Fairy Tales",
  "Adventure",
  "Fantasy",
  "Science Fiction",
];

const emojis = ["📖", "🐰", "🧚", "🚀", "🐉", "🌈"];

type Feedback = {
  title: string;
  message: string;
  type: "success" | "error" | "warning";
} | null;

type Props = {
  story: Story;
  onChanged: () => void;
};

export default function StoryActions({ story, onChanged }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(story.title);
  const [writerName, setWriterName] = useState(story.writerName);
  const [category, setCategory] = useState(story.category);
  const [emoji, setEmoji] = useState(story.emoji);
  const [content, setContent] = useState(story.story);
  const [imageUrl, setImageUrl] = useState(story.imageUrl ?? "");
  const [color, setColor] = useState(story.color);

  function showFeedback(
    title: string,
    message: string,
    type: "success" | "error" | "warning",
  ) {
    setFeedback({ title, message, type });
  }

  // Reset editor values
  function resetEditor() {
    setTitle(story.title);
    setWriterName(story.writerName);
    setCategory(story.category);
    setEmoji(story.emoji);
    setContent(story.story);
    setImageUrl(story.imageUrl ?? "");
    setColor(story.color);
  }

  // Open editor
  function openEditor() {
    resetEditor();
    setMenuVisible(false);
    setModalVisible(true);
  }

  // Close editor
  function closeEditor() {
    if (saving) return;

    Keyboard.dismiss();
    setModalVisible(false);
  }

  // Update story
  async function handleUpdate() {
    if (!title.trim() || !writerName.trim() || !content.trim()) {
      showFeedback(
        "Missing information",
        "Please enter a title, writer name, and story.",
        "warning",
      );
      return;
    }

    try {
      Keyboard.dismiss();
      setSaving(true);

      await updateStory(story.$id, {
        title: title.trim(),
        writerName: writerName.trim(),
        category,
        emoji,
        color,
        story: content.trim(),
        imageUrl: imageUrl.trim(),
      });

      setModalVisible(false);
      onChanged();

      showFeedback(
        "Story updated!",
        "Your changes have been saved successfully.",
        "success",
      );
    } catch (error) {
      console.error("Story update error:", error);

      showFeedback(
        "Couldn't update",
        "Check your connection and Appwrite permissions.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  // Open delete confirmation
  function handleDelete() {
    setMenuVisible(false);
    setDeleteVisible(true);
  }

  // Confirm delete
  async function confirmDelete() {
    try {
      setDeleting(true);

      await deleteStory(story.$id);

      setDeleteVisible(false);
      onChanged();

      showFeedback(
        "Story deleted",
        "Your story has been successfully removed.",
        "success",
      );
    } catch (error) {
      console.error("Story delete error:", error);

      setDeleteVisible(false);

      showFeedback(
        "Couldn't delete",
        "Check your connection and Appwrite permissions.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Three Dot Button */}
      <Pressable
        onPress={() => setMenuVisible(true)}
        className="h-10 w-10 items-center justify-center rounded-2xl border"
        style={{
          backgroundColor: CARD,
          borderColor: BORDER,
        }}
        hitSlop={8}
      >
        <EllipsisVertical size={20} color={PURPLE} />
      </Pressable>

      {/* Story Options Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          onPress={() => setMenuVisible(false)}
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full max-w-[320px] rounded-3xl border p-5"
            style={{
              backgroundColor: CARD,
              borderColor: BORDER,
              elevation: 15,
            }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-extrabold text-white">
                  Story Options
                </Text>
                <Text className="mt-1 text-xs" style={{ color: PURPLE }}>
                  Manage your story
                </Text>
              </View>

              <Pressable
                onPress={() => setMenuVisible(false)}
                className="h-9 w-9 items-center justify-center rounded-xl border"
                style={{
                  borderColor: BORDER,
                  backgroundColor: BG,
                }}
              >
                <X size={18} color={PURPLE} />
              </Pressable>
            </View>

            {/* Edit Story */}
            <Pressable
              onPress={openEditor}
              className="flex-row items-center gap-3 rounded-2xl p-4"
              style={{ backgroundColor: BG }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#382957" }}
              >
                <Pencil size={19} color={PURPLE} />
              </View>

              <View className="flex-1">
                <Text className="font-bold text-white">Edit Story</Text>
                <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                  Update your story details
                </Text>
              </View>
            </Pressable>

            {/* Delete Story */}
            <Pressable
              onPress={handleDelete}
              className="mt-3 flex-row items-center gap-3 rounded-2xl p-4"
              style={{ backgroundColor: BG }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#38202D" }}
              >
                <Trash2 size={19} color="#F87171" />
              </View>

              <View className="flex-1">
                <Text className="font-bold" style={{ color: "#FCA5A5" }}>
                  Delete Story
                </Text>
                <Text className="mt-1 text-xs" style={{ color: MUTED }}>
                  Permanently remove this story
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!deleting) setDeleteVisible(false);
        }}
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.78)" }}
        >
          <View
            className="w-full max-w-[360px] rounded-[26px] border"
            style={{
              backgroundColor: CARD,
              borderColor: BORDER,
              paddingHorizontal: 24,
              paddingTop: 26,
              paddingBottom: 24,
              alignItems: "center",
              elevation: 20,
            }}
          >
            {/* Warning Icon */}
            <View
              className="mb-5 h-14 w-14 items-center justify-center self-center rounded-full"
              style={{ backgroundColor: "#38202D", padding: 10, width: 50 }}
            >
              <AlertTriangle size={26} color="#F87171" strokeWidth={2} />
            </View>

            {/* Title */}
            <Text className="text-center text-xl font-extrabold text-white">
              Delete this story?
            </Text>

            {/* Description */}
            <Text
              className="mt-3 text-center text-[13px] leading-[21px]"
              style={{ color: MUTED }}
            >
              Are you sure you want to permanently delete{" "}
              <Text className="font-bold text-white">{story.title}</Text>? This
              action cannot be undone.
            </Text>

            {/* Action Buttons */}
            <View className="mt-7 flex-row gap-3">
              <Pressable
                onPress={() => setDeleteVisible(false)}
                disabled={deleting}
                className="h-[48px] flex-1 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: BG,
                  borderColor: BORDER,
                  opacity: deleting ? 0.5 : 1,
                  height: 40,
                }}
              >
                <Text className="text-sm font-bold text-white">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                className="h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-xl"
                style={{
                  backgroundColor: "#DC454F",
                  height: 40,
                  opacity: deleting ? 0.65 : 1,
                }}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text className="text-sm font-bold text-white">Delete</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={feedback !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFeedback(null)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        >
          <View
            className="w-full max-w-[330px] items-center rounded-3xl border p-6"
            style={{
              backgroundColor: CARD,
              borderColor: BORDER,
              elevation: 20,
            }}
          >
            <View
              className="mb-5 h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor:
                  feedback?.type === "success"
                    ? "#243B35"
                    : feedback?.type === "warning"
                      ? "#3D3422"
                      : "#38202D",
              }}
            >
              {feedback?.type === "success" ? (
                <CheckCircle2 size={28} color="#4ADE80" />
              ) : feedback?.type === "warning" ? (
                <AlertCircle size={28} color="#FBBF24" />
              ) : (
                <AlertCircle size={28} color="#F87171" />
              )}
            </View>

            <Text className="text-center text-xl font-extrabold text-white">
              {feedback?.title}
            </Text>

            <Text
              className="mt-3 text-center text-sm leading-6"
              style={{ color: MUTED }}
            >
              {feedback?.message}
            </Text>

            <Pressable
              onPress={() => setFeedback(null)}
              className="mt-7 h-12 w-full items-center justify-center rounded-xl"
              style={{ backgroundColor: PURPLE }}
            >
              <Text className="font-extrabold" style={{ color: BG }}>
                Got it
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Edit Story Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeEditor}
      >
        <SafeAreaView
          className="flex-1"
          style={{ backgroundColor: BG }}
          edges={["top", "bottom"]}
        >
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 22,
                paddingTop: 20,
                paddingBottom: 35,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="mb-2 text-[10px] font-extrabold tracking-[1.6px]"
                    style={{ color: PURPLE }}
                  >
                    YOUR CREATIVE SPACE
                  </Text>

                  <Text className="text-[28px] font-extrabold text-white">
                    Edit your story
                  </Text>

                  <Text className="mt-2 text-[13px]" style={{ color: MUTED }}>
                    Make your story even better.
                  </Text>
                </View>

                <Pressable
                  onPress={closeEditor}
                  disabled={saving}
                  className="ml-3 h-12 w-12 items-center justify-center rounded-2xl border"
                  style={{
                    backgroundColor: CARD,
                    borderColor: BORDER,
                  }}
                >
                  <X size={22} color={PURPLE} />
                </Pressable>
              </View>

              {/* Tip */}
              <View
                className="mb-6 flex-row items-center gap-3 rounded-2xl border p-4"
                style={{
                  backgroundColor: CARD,
                  borderColor: BORDER,
                }}
              >
                <Sparkles size={18} color={PURPLE} />
                <Text className="flex-1 text-[13px]" style={{ color: MUTED }}>
                  Every little change can make a story special.
                </Text>
              </View>

              {/* Title */}
              <InputField
                label="Story title"
                value={title}
                onChangeText={setTitle}
                placeholder="Give your story a name..."
                maxLength={120}
                returnKeyType="next"
              />

              {/* Writer */}
              <InputField
                label="Your name"
                value={writerName}
                onChangeText={setWriterName}
                placeholder="Enter your writer name"
                maxLength={60}
                returnKeyType="done"
              />

              {/* Categories */}
              <Text className="mb-3 mt-5 text-sm font-bold text-white">
                Choose a category
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {categories.map((item) => {
                  const selected = category === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        Keyboard.dismiss();
                        setCategory(item);
                      }}
                      className="rounded-full border px-4 py-3"
                      style={{
                        backgroundColor: selected ? "#382957" : CARD,
                        borderColor: selected ? PURPLE : BORDER,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: selected ? "#FFFFFF" : MUTED }}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Emoji */}
              <Text className="mb-3 mt-5 text-sm font-bold text-white">
                Choose a story emoji
              </Text>

              <View className="flex-row flex-wrap gap-3">
                {emojis.map((item) => {
                  const selected = emoji === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        Keyboard.dismiss();
                        setEmoji(item);
                      }}
                      className="h-12 w-12 items-center justify-center rounded-2xl border"
                      style={{
                        backgroundColor: selected ? "#382957" : CARD,
                        borderColor: selected ? PURPLE : BORDER,
                      }}
                    >
                      <Text className="text-2xl">{item}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Cover Color */}
              <InputField
                label="Cover color"
                value={color}
                onChangeText={setColor}
                placeholder="#A78BFA"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              {/* Image URL */}
              <InputField
                label="Story cover image URL"
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Paste image URL..."
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              {/* Story Content Header */}
              <View className="flex-row items-center justify-between">
                <Text className="mb-2 mt-5 text-sm font-bold text-white">
                  Your story
                </Text>

                <Text
                  className="mb-2 mt-5 text-[11px]"
                  style={{ color: MUTED }}
                >
                  {content.length}/10000
                </Text>
              </View>

              {/* Story Content */}
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Once upon a time..."
                placeholderTextColor="#77718D"
                multiline
                textAlignVertical="top"
                maxLength={10000}
                returnKeyType="default"
                blurOnSubmit={false}
                autoCorrect
                className="h-[230px] rounded-2xl border px-4 py-4 text-sm leading-6 text-white"
                style={{
                  backgroundColor: CARD,
                  borderColor: BORDER,
                  minHeight: 220,
                }}
              />

              {/* Action Buttons */}
              <View className="mt-7 flex-col gap-3">
                <Pressable
                  onPress={handleUpdate}
                  disabled={saving}
                  className="flex-row items-center justify-center gap-2 rounded-2xl"
                  style={{
                    height: 50,
                    backgroundColor: PURPLE,
                    opacity: saving ? 0.65 : 1,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color={BG} size="small" />
                  ) : (
                    <>
                      <Pencil size={19} color={BG} />
                      <Text
                        className="text-base font-extrabold"
                        style={{ color: BG }}
                      >
                        Save Changes
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={closeEditor}
                  disabled={saving}
                  className="flex-row items-center justify-center gap-2 rounded-2xl border"
                  style={{
                    height: 50,
                    backgroundColor: CARD,
                    borderColor: BORDER,
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  <X size={19} color={MUTED} />
                  <Text className="text-base font-bold text-white">Cancel</Text>
                </Pressable>
              </View>

              {/* Footer */}
              <Text
                className="mt-5 text-center text-[11px]"
                style={{ color: "#77718D" }}
              >
                Made with imagination, shared with TinyTales.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// Reusable Input Component
type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  returnKeyType?: "next" | "done";
  autoCorrect?: boolean;
};

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  autoCapitalize = "sentences",
  returnKeyType = "done",
  autoCorrect = true,
}: InputFieldProps) {
  return (
    <>
      <Text className="mb-2 mt-5 text-sm font-bold text-white">{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#77718D"
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        blurOnSubmit
        maxLength={maxLength}
        className="rounded-2xl border px-4 py-4 text-sm text-white"
        style={{
          backgroundColor: CARD,
          borderColor: BORDER,
        }}
      />
    </>
  );
}
