// src/app/(tabs)/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BukuOpenLibrary } from "../../../types/buku";
import BookCard from "../../components/BookCard";
import { ThemedText as Text } from "../../components/themed-text";
import { useThemePreference } from "../../contexts/theme-context";
import { cariBuku } from "../../services/openLibraryService";

export default function HalamanUtama() {
  const { colors } = useThemePreference();
  const [kueri, setKueri] = useState("");
  const [hasil, setHasil] = useState<BukuOpenLibrary[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sudahMencari, setSudahMencari] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  async function cariBukuOpenLibrary() {
    const kueriBersih = kueri.trim();
    if (!kueriBersih) {
      setHasil([]);
      setSudahMencari(true);
      setPesanError("Masukkan judul buku atau nama penulis.");
      return;
    }

    const requestId = ++requestIdRef.current;
    setSedangMemuat(true);
    setSudahMencari(true);
    setPesanError(null);

    try {
      const buku = await cariBuku(kueriBersih);
      if (requestId === requestIdRef.current) setHasil(buku);
    } catch {
      if (requestId === requestIdRef.current) {
        setHasil([]);
        setPesanError(
          "Tidak dapat mengambil data dari Open Library. Periksa koneksi internet lalu coba lagi.",
        );
      }
    } finally {
      if (requestId === requestIdRef.current) setSedangMemuat(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 22,
          paddingBottom: 28,
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text
            style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}
          >
            CARIBOOK
          </Text>
          <Text style={{ fontSize: 26, lineHeight: 32, fontWeight: "700" }}>
            Cari buku dan penulis
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Telusuri katalog Open Library.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <View
            style={{
              minHeight: 54,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
            }}
          >
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textSecondary}
            />
            <TextInput
              value={kueri}
              onChangeText={setKueri}
              onSubmitEditing={() => void cariBukuOpenLibrary()}
              placeholder="Judul buku atau nama penulis"
              accessibilityLabel="Cari judul buku atau nama penulis"
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.accent}
              returnKeyType="search"
              style={{
                flex: 1,
                minWidth: 0,
                height: 52,
                paddingHorizontal: 11,
                color: colors.text,
                fontSize: 15,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={sedangMemuat}
            onPress={() => void cariBukuOpenLibrary()}
            style={({ pressed }) => ({
              minHeight: 48,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 10,
              backgroundColor: colors.accent,
              opacity: pressed || sedangMemuat ? 0.72 : 1,
            })}
          >
            {sedangMemuat ? (
              <ActivityIndicator color={colors.backgroundElement} />
            ) : (
              <Ionicons
                name="search-outline"
                size={17}
                color={colors.backgroundElement}
              />
            )}
            <Text
              style={{
                color: colors.backgroundElement,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {sedangMemuat ? "Mencari..." : "Cari"}
            </Text>
          </Pressable>
        </View>

        {pesanError && (
          <Text style={{ color: colors.danger, fontSize: 14 }}>
            {pesanError}
          </Text>
        )}

        {hasil.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: "700" }}>
              Hasil pencarian ({hasil.length})
            </Text>
            <View
              style={{
                overflow: "hidden",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.backgroundElement,
              }}
            >
              {hasil.map((buku, index) => (
                <View
                  key={buku.key || `${buku.title}-${index}`}
                  style={{
                    minHeight: 134,
                    borderBottomWidth: index === hasil.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <BookCard book={buku} />
                </View>
              ))}
            </View>
          </View>
        )}

        {sudahMencari && !sedangMemuat && !pesanError && hasil.length === 0 && (
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Tidak ada buku yang cocok dengan pencarian ini.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
