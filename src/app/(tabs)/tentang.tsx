// app/(tabs)/tentang.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText as Text } from "../../components/themed-text";
import { spacing, typeScale } from "../../constants/styles";
import { useThemePreference } from "../../contexts/theme-context";

export default function TabTentang() {
  const { colors } = useThemePreference();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ padding: spacing.sedang, gap: spacing.sedang }}>
        <View style={{ gap: 4 }}>
          <Text
            style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}
          >
            APLIKASI
          </Text>
          <Text
            accessibilityLabel="Judul halaman Tentang Aplikasi"
            style={{ fontSize: typeScale.judul, fontWeight: "700" }}
          >
            Tentang
          </Text>
        </View>

        <View
          style={{
            padding: 20,
            alignItems: "flex-start",
            gap: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElement,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: colors.backgroundSelected,
            }}
          >
            <Ionicons name="compass-outline" size={30} color={colors.accent} />
          </View>
          <View style={{ gap: 5 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>
              Jelajah Aman
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typeScale.isi,
                lineHeight: 21,
              }}
            >
              Informasi cuaca dan kualitas udara untuk membantu Anda
              merencanakan perjalanan.
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: colors.border,
            }}
          />
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Versi
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600" }}>1.0.0</Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Pembuat
            </Text>
            <Text
              style={{ fontSize: 13, fontWeight: "600", textAlign: "right" }}
            >
              Davin Aurellio W
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
