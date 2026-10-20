// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import { ThemeMode, useThemePreference } from "../../contexts/theme-context";
import { hapusSemuaCache } from "../../services/cacheRepository";

const PILIHAN_TEMA: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Terang" },
  { mode: "dark", label: "Gelap" },
  { mode: "system", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const { colors, mode, setMode } = useThemePreference();
  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 28, gap: 22 }}>
        <View style={{ gap: 4 }}>
          <ThemedText style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
            PREFERENSI
          </ThemedText>
          <ThemedText style={{ fontSize: 25, lineHeight: 31, fontWeight: "700" }}>
            Pengaturan
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 14 }}>
            Sesuaikan tampilan dan data yang tersimpan.
          </ThemedText>
        </View>

        <View style={{ gap: 9 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="contrast-outline" size={18} color={colors.accent} />
            <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
              Mode tampilan
            </ThemedText>
          </View>
          <View
            accessibilityRole="radiogroup"
            style={{
              flexDirection: "row",
              padding: 4,
              borderRadius: 12,
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            {PILIHAN_TEMA.map((pilihan) => {
              const dipilih = mode === pilihan.mode;
              return (
                <Pressable
                  key={pilihan.mode}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: dipilih }}
                  onPress={() => setMode(pilihan.mode)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9,
                    backgroundColor: dipilih ? colors.backgroundSelected : "transparent",
                    opacity: pressed ? 0.72 : 1,
                  })}
                >
                  <ThemedText
                    style={{
                      color: dipilih ? colors.accent : colors.textSecondary,
                      fontWeight: dipilih ? "700" : "500",
                      fontSize: 13,
                    }}
                  >
                    {pilihan.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 9 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-outline" size={18} color={colors.accent} />
            <ThemedText style={{ fontSize: 15, fontWeight: "700" }}>
              Penyimpanan
            </ThemedText>
          </View>
          <View
            style={{
              padding: 15,
              gap: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
            }}
          >
            <ThemedText style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
              Hapus data cuaca lokal untuk mengosongkan ruang di perangkat.
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={hapusDataTersimpan}
              style={({ pressed }) => ({
                minHeight: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="trash-outline" size={17} color={colors.danger} />
              <ThemedText style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>
                Hapus data cuaca tersimpan
              </ThemedText>
            </Pressable>
            {pesan && (
              <ThemedText
                accessibilityLabel={pesan}
                style={{ color: colors.accent, fontSize: 13 }}
              >
                {pesan}
              </ThemedText>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 4,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: colors.backgroundSelected,
            }}
          >
            <Ionicons name="compass-outline" size={22} color={colors.accent} />
          </View>
          <View style={{ gap: 2 }}>
            <ThemedText style={{ fontWeight: "700" }}>Jelajah Aman</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              Versi 1.0.0
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
