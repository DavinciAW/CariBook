// src/components/WeatherCard.tsx
import { View } from "react-native";
import { WeatherCardProps } from "../../types/cuaca";
import { spacing, typeScale } from "../constants/styles";
import { useThemePreference } from "../contexts/theme-context";
import { ThemedText } from "./themed-text";
const warnaPerTingkat = {
  light: {
    BAIK: "#167A50",
    SEDANG: "#8A6200",
    TIDAK_SEHAT: "#C2410C",
    BERBAHAYA: "#B42318",
  },
  dark: {
    BAIK: "#70D6A6",
    SEDANG: "#FFD166",
    TIDAK_SEHAT: "#FF9F6E",
    BERBAHAYA: "#FF8A80",
  },
};
export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
  pm10,
  pm25,
}: WeatherCardProps) {
  const { colors, resolvedTheme } = useThemePreference();
  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori
${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;
  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: colors.backgroundElement,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <ThemedText style={{ fontWeight: "bold", fontSize: typeScale.judul }}>
        {kota}
      </ThemedText>
      <ThemedText style={{ fontSize: 32 }}>{suhu}°C</ThemedText>
      <ThemedText
        style={{
          color: warnaPerTingkat[resolvedTheme][tingkatAQI],
          fontSize: typeScale.isi,
          fontWeight: "600",
        }}
      >
        {teksAQI}
      </ThemedText>
      {(pm10 !== undefined || pm25 !== undefined) && (
        <ThemedText
          style={{
            color: colors.textSecondary,
            fontSize: typeScale.keterangan,
            marginTop: 2,
          }}
        >
          PM10 {pm10 !== undefined ? `${pm10} µg/m³` : "-"} · PM2.5{" "}
          {pm25 !== undefined ? `${pm25} µg/m³` : "-"}
        </ThemedText>
      )}
    </View>
  );
}
