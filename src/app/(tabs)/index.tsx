// src/app/(tabs)/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 28,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4 }}>
          <Text
            style={{
              color: colors.accent,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            CARIBOOK
          </Text>
          <Text style={{ fontSize: 26, lineHeight: 32, fontWeight: "700" }}>
            Cuaca dan udara
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Temukan kondisi kota yang ingin Anda jelajahi.
          </Text>
        </View>

        <SearchBox onCari={setTeksCari} />
        <Pressable
          onPress={gunakanLokasiSaatIni}
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.accent,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <Ionicons name="navigate-outline" size={17} color={colors.accent} />
          <Text
            style={{ color: colors.accent, fontSize: 14, fontWeight: "600" }}
          >
            Gunakan Lokasi Saat Ini
          </Text>
        </Pressable>

        {pesanLokasi && (
          <Text
            accessibilityLabel={pesanLokasi}
            style={{ color: colors.danger, fontSize: 13 }}
          >
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.length > 0 && (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              overflow: "hidden",
            }}
          >
            {hasilPencarian.map((kota, index) => (
              <TouchableOpacity
                key={kota.id}
                accessibilityRole="button"
                onPress={() => pilihKota(kota)}
                style={{
                  minHeight: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 14,
                  borderBottomWidth:
                    index === hasilPencarian.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={colors.accent}
                />
                <Text style={{ flex: 1, fontSize: 14 }}>{kota.name}</Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name="cloud-offline-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text style={{ fontSize: 15, fontWeight: "700" }}>
                  Tersimpan offline
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {kotaTersimpan.length} kota
              </Text>
            </View>
            <View
              style={{
                overflow: "hidden",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.backgroundElement,
              }}
            >
              {kotaTersimpan.map((k, index) => (
                <View
                  key={k.kunci}
                  style={{
                    minHeight: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingLeft: 14,
                    borderBottomWidth:
                      index === kotaTersimpan.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
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
                    style={{ flex: 1, minHeight: 48, justifyContent: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "500" }}>
                      {k.nama}
                    </Text>
                  </TouchableOpacity>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus cache ${k.nama}`}
                    accessibilityHint="Meminta konfirmasi sebelum menghapus data offline kota ini"
                    hitSlop={8}
                    onPress={() => konfirmasiHapusCache(k)}
                    style={{
                      width: 44,
                      height: 44,
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
          </View>
        )}

        {sedangMemuat && <ActivityIndicator />}
        {pesanError && (
          <View
            style={{
              gap: 10,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.danger,
              backgroundColor: colors.backgroundElement,
            }}
          >
            <Text
              accessibilityLabel={pesanError}
              style={{ color: colors.text, fontSize: 14 }}
            >
              {pesanError}
            </Text>
            <Pressable
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              style={{ alignSelf: "flex-start", paddingVertical: 6 }}
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                Coba lagi
              </Text>
            </Pressable>
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
              pm10={hasil.kualitasUdara.pm10}
              pm25={hasil.kualitasUdara.pm25}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => pilihKota(kotaTerpilih, true)}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 46,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  borderRadius: 10,
                  backgroundColor: colors.backgroundSelected,
                  opacity: pressed ? 0.72 : 1,
                })}
              >
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={colors.accent}
                />
                <Text
                  style={{
                    color: colors.accent,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Perbarui
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
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
                style={({ pressed }) => ({
                  flex: 1.4,
                  minHeight: 46,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  borderRadius: 10,
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons
                  name="heart-outline"
                  size={17}
                  color={colors.backgroundElement}
                />
                <Text
                  style={{
                    color: colors.backgroundElement,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Tambah favorit
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
