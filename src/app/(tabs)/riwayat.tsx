// src/app/(tabs)/riwayat.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Button,
    Platform,
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Riwayat Pencarian
        </Text>
        {riwayatPencarian.length === 0 && (
          <Text>Belum ada riwayat pencarian</Text>
        )}
        {riwayatPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            accessibilityRole="button"
            onPress={() => bukaRiwayat(kota)}
            style={{ paddingVertical: 8 }}
          >
            <Text>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 12 }}>
          Kota Favorit
        </Text>
        <Text>Tersimpan {daftarFavorit.length} kota</Text>
        {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}
        {daftarFavorit.map((kota) => (
          <View
            key={kota.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>{kota.nama}</Text>
            <Button
              title="Hapus"
              color={colors.danger}
              onPress={() => konfirmasiHapus(kota)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
