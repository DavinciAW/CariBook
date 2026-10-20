// src/components/WeatherCard.tsx
import { View } from "react-native";
import { WeatherCardProps } from "../../types/cuaca";
import { typeScale } from "../constants/styles";
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
  const nilaiAQI = indeksAQI === undefined ? "--" : indeksAQI;
  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: 18,
        borderRadius: 14,
        backgroundColor: colors.backgroundElement,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText
            style={{ color: colors.textSecondary, fontSize: typeScale.keterangan }}
          >
            KONDISI SAAT INI
          </ThemedText>
          <ThemedText
            numberOfLines={2}
            style={{ fontWeight: "700", fontSize: 21, lineHeight: 27 }}
          >
            {kota}
          </ThemedText>
        </View>
        <ThemedText
          style={{ fontSize: 40, lineHeight: 46, fontWeight: "300" }}
        >
          {suhu}°
        </ThemedText>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 16,
        }}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            flex: 1,
            minHeight: 74,
            justifyContent: "center",
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: colors.backgroundSelected,
          }}
        >
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            Kualitas udara
          </ThemedText>
          <ThemedText
            style={{
              color: warnaPerTingkat[resolvedTheme][tingkatAQI],
              fontSize: 16,
              fontWeight: "700",
              marginTop: 3,
            }}
          >
            AQI {nilaiAQI} · {tingkatAQI}
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            minHeight: 74,
            justifyContent: "center",
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: colors.background,
          }}
        >
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            Partikulat
          </ThemedText>
          <ThemedText style={{ fontSize: 13, fontWeight: "600", marginTop: 3 }}>
            PM10 {pm10 ?? "--"} · PM2.5 {pm25 ?? "--"}
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 10 }}>
            µg/m³
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
