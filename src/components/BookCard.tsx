import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { BukuOpenLibrary } from "../../types/buku";
import { useThemePreference } from "../contexts/theme-context";
import { ThemedText as Text } from "./themed-text";

interface BookCardProps {
  book: BukuOpenLibrary;
}

export default function BookCard({ book }: BookCardProps) {
  const { colors } = useThemePreference();
  const [coverFailed, setCoverFailed] = useState(false);
  const coverUri = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 12,
      }}
    >
      {coverUri && !coverFailed ? (
        <Image
          source={{ uri: coverUri }}
          accessibilityLabel={`Sampul ${book.title}`}
          contentFit="cover"
          onError={() => setCoverFailed(true)}
          style={{ width: 76, height: 110, borderRadius: 4 }}
        />
      ) : (
        <View
          accessibilityLabel="Sampul tidak tersedia"
          style={{
            width: 76,
            height: 110,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            backgroundColor: colors.backgroundSelected,
          }}
        >
          <Ionicons name="book-outline" size={28} color={colors.accent} />
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
        <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: "700" }}>
          {book.title}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {book.author_name?.join(", ") || "Penulis tidak diketahui"}
        </Text>
        {typeof book.first_publish_year === "number" && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              lineHeight: 17,
            }}
          >
            Terbit pertama: {book.first_publish_year}
          </Text>
        )}
      </View>
    </View>
  );
}
