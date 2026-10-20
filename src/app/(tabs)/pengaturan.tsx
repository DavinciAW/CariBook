// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Button, Pressable, View } from "react-native";
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
        padding: 16,
        gap: 12,
        backgroundColor: colors.background,
      }}
    >
      <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
        Tampilan
      </ThemedText>
      <View
        accessibilityRole="radiogroup"
        style={{
          flexDirection: "row",
          padding: 4,
          borderRadius: 10,
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
              style={{
                flex: 1,
                minHeight: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 7,
                backgroundColor: dipilih
                  ? colors.backgroundSelected
                  : "transparent",
              }}
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
      <ThemedText style={{ fontSize: 18, fontWeight: "bold", marginTop: 12 }}>
        Jelajah Aman
      </ThemedText>
      <ThemedText>Versi 1.0.0</ThemedText>
      <Button
        title="Hapus Data Cuaca Tersimpan"
        color={colors.accent}
        onPress={hapusDataTersimpan}
      />
      {pesan && <ThemedText accessibilityLabel={pesan}>{pesan}</ThemedText>}
    </SafeAreaView>
  );
}
