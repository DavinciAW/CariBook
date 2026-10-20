// src/app/(tabs)/riwayat.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    Alert,
    Platform,
  Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KotaFavorit } from "../../../types/favorit";
import { HasilGeocoding } from "../../../types/geocoding";
import { ThemedText as Text } from "../../components/themed-text";
import { useThemePreference } from "../../contexts/theme-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayatPencarian } from "../../services/riwayatPencarianStorage";
export default function TabRiwayat() {
  const { colors } = useThemePreference();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayatPencarian, setRiwayatPencarian] = useState<HasilGeocoding[]>(
    [],
  );
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
      ambilRiwayatPencarian().then(setRiwayatPencarian);
    }, []),
  );
  function bukaRiwayat(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        historyId: String(kota.id),
        historyName: kota.name,
        historyLatitude: String(kota.latitude),
        historyLongitude: String(kota.longitude),
        historyRequest: String(Date.now()),
      },
    });
  }
  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }
  function konfirmasiHapus(kota: KotaFavorit) {
    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus ${kota.nama}?`)) {
        void hapus(kota.id);
      }
      return;
    }

    Alert.alert("Konfirmasi hapus", `Yakin hapus ${kota.nama}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => hapus(kota.id),
      },
    ]);
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 28, gap: 22 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
            KOLEKSI KOTA
          </Text>
          <Text style={{ fontSize: 25, lineHeight: 31, fontWeight: "700" }}>
            Riwayat & favorit
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Buka kembali kota yang pernah dicari atau Anda simpan.
          </Text>
        </View>

        <View style={{ gap: 9 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="time-outline" size={18} color={colors.accent} />
            <Text style={{ fontSize: 15, fontWeight: "700" }}>
              Pencarian terakhir
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: "auto" }}>
              {riwayatPencarian.length}/10
            </Text>
          </View>
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              overflow: "hidden",
            }}
          >
            {riwayatPencarian.length === 0 ? (
              <View style={{ padding: 16, gap: 5 }}>
                <Text style={{ fontWeight: "600" }}>Belum ada pencarian</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Kota yang Anda cari akan muncul di sini.
                </Text>
              </View>
            ) : (
              riwayatPencarian.map((kota, index) => (
                <TouchableOpacity
                  key={kota.id}
                  accessibilityRole="button"
                  onPress={() => bukaRiwayat(kota)}
                  style={{
                    minHeight: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 14,
                    borderBottomWidth: index === riwayatPencarian.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Ionicons name="location-outline" size={17} color={colors.textSecondary} />
                  <Text style={{ flex: 1, fontSize: 14 }}>{kota.name}</Text>
                  <Ionicons name="arrow-forward-outline" size={16} color={colors.accent} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={{ gap: 9 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="heart-outline" size={18} color={colors.accent} />
            <Text style={{ fontSize: 15, fontWeight: "700" }}>Kota favorit</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: "auto" }}>
              {daftarFavorit.length} kota
            </Text>
          </View>
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              overflow: "hidden",
            }}
          >
            {daftarFavorit.length === 0 ? (
              <View style={{ padding: 16, gap: 5 }}>
                <Text style={{ fontWeight: "600" }}>Belum ada kota favorit</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Simpan kota dari Beranda untuk akses cepat.
                </Text>
              </View>
            ) : (
              daftarFavorit.map((kota, index) => (
                <View
                  key={kota.id}
                  style={{
                    minHeight: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingLeft: 14,
                    borderBottomWidth: index === daftarFavorit.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Ionicons name="heart" size={16} color={colors.accent} />
                  <Text style={{ flex: 1, fontSize: 14 }}>{kota.nama}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                    hitSlop={6}
                    onPress={() => konfirmasiHapus(kota)}
                    style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
