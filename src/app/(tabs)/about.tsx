import { useRouter } from "expo-router";
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    Heart,
    Lightbulb,
    MoonStar,
} from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#100D20";
const CARD = "#1D1833";
const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";
const BORDER = "#332A4B";

const features = [
  {
    icon: BookOpen,
    title: "Magical Stories",
    description: "Discover fairy tales and wonderful new worlds.",
  },
  {
    icon: Lightbulb,
    title: "Little Adventures",
    description: "Explore new ideas through stories and imagination.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "A cozy place for curious minds and creativity.",
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-2xl border active:opacity-70"
          style={{ backgroundColor: CARD, borderColor: BORDER }}
        >
          <ArrowLeft size={21} color="#FFFFFF" />
        </Pressable>

        <Text className="ml-4 text-lg font-extrabold text-white">
          About TinyTales
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10"
      >
        {/* App introduction */}
        <View
          className="mt-4 items-center rounded-[28px] border px-6 py-7"
          style={{ backgroundColor: CARD, borderColor: BORDER }}
        >
          <View
            className="h-28 w-28 overflow-hidden rounded-[28px] border"
            style={{ borderColor: BORDER }}
          >
            <Image
              source={require("../../../assets/images/icon.png")}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          <Text className="mt-5 text-3xl font-black text-white">
            Tiny<Text style={{ color: PURPLE }}>Tales</Text>
          </Text>

          <Text
            className="mt-3 text-center text-sm leading-6"
            style={{ color: MUTED }}
          >
            A little place for big imaginations. Discover magical stories,
            lovable characters, and exciting adventures.
          </Text>
        </View>

        {/* About */}
        <View className="mt-8">
          <Text className="text-xl font-black text-white">About the app</Text>

          <View
            className="mt-4 rounded-[22px] border p-5"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            <Text className="text-sm leading-7 text-white/85">
              TinyTales brings stories and imagination together in one place.
              Explore animal stories, fairy tales, adventures, fantasy, and
              science fiction.
              {"\n\n"}
              Every story is an opportunity to learn something new and discover
              a world beyond your own.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View className="mt-8">
          <Text className="text-xl font-black text-white">
            What you can explore
          </Text>

          <View className="mt-4 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <View
                  key={feature.title}
                  className="flex-row items-center rounded-[22px] border p-4"
                  style={{ backgroundColor: CARD, borderColor: BORDER }}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "#30234F" }}
                  >
                    <Icon size={22} color={PURPLE} />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-sm font-extrabold text-white">
                      {feature.title}
                    </Text>

                    <Text
                      className="mt-1 text-xs leading-5"
                      style={{ color: MUTED }}
                    >
                      {feature.description}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={MUTED} />
                </View>
              );
            })}
          </View>
        </View>

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          className="mt-8 min-h-12 flex-row items-center justify-center rounded-2xl active:opacity-75"
          style={{ backgroundColor: PURPLE }}
        >
          <MoonStar size={18} color={BG} />
          <Text className="ml-2 font-extrabold" style={{ color: BG }}>
            Back to exploring
          </Text>
        </Pressable>

        {/* Footer */}
        <Text className="mt-6 text-center text-xs" style={{ color: MUTED }}>
          TinyTales · Stories for curious minds
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
