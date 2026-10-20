// types/cuaca.ts
export interface DataCuaca {
  kota: string;
  suhu: number;
  kelembapan: number;
  catatan?: string;
}
export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";
export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
  indeksAQI?: number;
  pm10?: number;
  pm25?: number;
}
export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";
  diperbaruiPada?: string;
}
