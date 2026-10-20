import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../../types/geocoding";

const KUNCI_PENYIMPANAN = "@jelajah_aman:riwayat_pencarian";
const BATAS_RIWAYAT = 10;

export async function ambilRiwayatPencarian(): Promise<HasilGeocoding[]> {
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
  return json ? JSON.parse(json) : [];
}

export async function simpanRiwayatPencarian(
  kota: HasilGeocoding,
): Promise<void> {
  const riwayat = await ambilRiwayatPencarian();
  const riwayatBaru = [
    kota,
    ...riwayat.filter((item) => item.id !== kota.id),
  ].slice(0, BATAS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(riwayatBaru));
}
