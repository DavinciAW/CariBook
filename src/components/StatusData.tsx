// src/components/StatusData.tsx
import { View } from "react-native";
import { SumberData } from "../../types/cache";
import { useThemePreference } from "../contexts/theme-context";
import { ThemedText } from "./themed-text";
interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}
function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}
function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}
export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { colors, resolvedTheme } = useThemePreference();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);
  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor:
          resolvedTheme === "dark"
            ? basi
              ? "#3A2B20"
              : "#18332F"
            : basi
              ? "#FEF3E2"
              : "#EAFBF6",
      }}
    >
      <ThemedText
        style={{
          fontSize: 12,
          color: basi
            ? resolvedTheme === "dark"
              ? "#FFC078"
              : "#B45309"
            : colors.accent,
        }}
      >
        {label}
      </ThemedText>
      <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
        Diperbarui {umur}
      </ThemedText>
    </View>
  );
}
