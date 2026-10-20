// src/app/(tabs)/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Platform,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HasilGeocoding } from "../../../types/geocoding";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import { ThemedText as Text } from "../../components/themed-text";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useThemePreference } from "../../contexts/theme-context";
import { useDebounce } from "../../hooks/use-debounce";
import {
    bersihkanCacheLama,
    daftarKotaTersimpan,
    hapusCache,
} from "../../services/cacheRepository";
import {
    ambilCuacaOfflineFirst,
    BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { cariKota } from "../../services/geocodingService";
import {
    ambilKoordinatSaatIni,
    mintaIzinLokasi,
} from "../../services/locationService";
import { simpanRiwayatPencarian } from "../../services/riwayatPencarianStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import {
    HasilCuacaOffline,
    RingkasanKotaTersimpan,
} from "..//../../types/cache";
export default function HalamanUtama() {
  const { colors } = useThemePreference();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition
  const permintaanRiwayat = useLocalSearchParams<{
    historyId?: string;
    historyName?: string;
    historyLatitude?: string;
    historyLongitude?: string;
    historyRequest?: string;
  }>();
  const riwayatTerakhirDiproses = useRef<string | undefined>(undefined);
  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }
  async function hapusCacheKota(kunci: string) {
    await hapusCache(kunci);
    await muatKotaTersimpan();
  }
  function konfirmasiHapusCache(kota: RingkasanKotaTersimpan) {
    const pesan = `Hapus cache cuaca ${kota.nama} dari perangkat?`;
    if (Platform.OS === "web") {
      if (window.confirm(pesan)) {
        void hapusCacheKota(kota.kunci);
      }
      return;
    }

    Alert.alert("Hapus cache kota?", pesan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => void hapusCacheKota(kota.kunci),
      },
    ]);
  }
  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);
  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      await simpanRiwayatPencarian(kota).catch(() => {});
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }
  useEffect(() => {
    const {
      historyId,
      historyName,
      historyLatitude,
      historyLongitude,
      historyRequest,
    } = permintaanRiwayat;
    if (
      !historyRequest ||
      historyRequest === riwayatTerakhirDiproses.current ||
      !historyId ||
      !historyName ||
      !historyLatitude ||
      !historyLongitude
    ) {
      return;
    }
    riwayatTerakhirDiproses.current = historyRequest;
    void pilihKota({
      id: Number(historyId),
      name: historyName,
      latitude: Number(historyLatitude),
      longitude: Number(historyLongitude),
      country: "",
    });
  }, [
    permintaanRiwayat.historyId,
    permintaanRiwayat.historyName,
    permintaanRiwayat.historyLatitude,
    permintaanRiwayat.historyLongitude,
    permintaanRiwayat.historyRequest,
  ]);
  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
      );
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />
        <Button
          title="Gunakan Lokasi Saat Ini"
          color={colors.accent}
          onPress={gunakanLokasiSaatIni}
        />
        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi}>{pesanLokasi}</Text>
        )}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text>{kota.name}</Text>
          </TouchableOpacity>
        ))}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: "bold" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                  style={{ flex: 1, paddingVertical: 4 }}
                >
                  <Text>{k.nama}</Text>
                </TouchableOpacity>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus cache ${k.nama}`}
                  accessibilityHint="Meminta konfirmasi sebelum menghapus data offline kota ini"
                  hitSlop={8}
                  onPress={() => konfirmasiHapusCache(k)}
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
        {sedangMemuat && <ActivityIndicator />}
        {pesanError && (
          <View>
            <Text accessibilityLabel={pesanError}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              color={colors.accent}
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              color={colors.accent}
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",

                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
