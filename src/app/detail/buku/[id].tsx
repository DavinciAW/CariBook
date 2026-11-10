import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DetailBukuOpenLibrary } from "../../../../types/detailBuku";
import { ThemedText as Text } from "../../../components/themed-text";
import { useThemePreference } from "../../../contexts/theme-context";
import {
  ambilDetailBuku,
  BukuTidakDitemukanError,
} from "../../../services/openLibraryDetailService";

function nilaiParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function tahunParam(value?: string | string[]): number | undefined {
  const parsed = Number(nilaiParam(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function sampulParam(value?: string | string[]): number | undefined {
  const parsed = Number(nilaiParam(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function SampulDetail({
  coverId,
  title,
  colors,
}: {
  coverId?: number;
  title: string;
  colors: ReturnType<typeof useThemePreference>["colors"];
}) {
  const [failed, setFailed] = useState(false);
  const uri = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : undefined;

  if (!uri || failed) {
    return (
      <View
        accessibilityLabel="Sampul tidak tersedia"
        style={{
          width: 156,
          height: 224,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          backgroundColor: colors.backgroundSelected,
        }}
      >
        <Ionicons name="book-outline" size={44} color={colors.accent} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      accessibilityLabel={`Sampul ${title}`}
      contentFit="cover"
      onError={() => setFailed(true)}
      style={{ width: 156, height: 224, borderRadius: 6 }}
    />
  );
}

function DetailRow({
  label,
  value,
  unavailable,
  colors,
}: {
  label: string;
  value?: string;
  unavailable: string;
  colors: ReturnType<typeof useThemePreference>["colors"];
}) {
  return (
    <View
      style={{
        gap: 4,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ fontSize: 14, lineHeight: 20 }}>
        {value?.trim() || unavailable}
      </Text>
    </View>
  );
}

export default function DetailBukuScreen() {
  const { colors } = useThemePreference();
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    author?: string | string[];
    year?: string | string[];
    cover?: string | string[];
  }>();
  const id = nilaiParam(params.id);
  const titleFallback = nilaiParam(params.title);
  const authorParam = nilaiParam(params.author);
  let authorFallback: string[] | undefined;
  try {
    const parsedAuthors: unknown = authorParam
      ? JSON.parse(authorParam)
      : undefined;
    if (Array.isArray(parsedAuthors)) {
      authorFallback = parsedAuthors.filter(
        (author): author is string =>
          typeof author === "string" && Boolean(author.trim()),
      );
    }
  } catch {
    authorFallback = authorParam ? [authorParam] : undefined;
  }
  const yearFallback = tahunParam(params.year);
  const coverFallback = sampulParam(params.cover);
  const [detail, setDetail] = useState<DetailBukuOpenLibrary | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [percobaan, setPercobaan] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    if (!id) {
      setDetail(null);
      setPesanError("Buku tidak ditemukan.");
      setSedangMemuat(false);
      return;
    }

    setSedangMemuat(true);
    setPesanError(null);
    ambilDetailBuku(id, {
      title: titleFallback,
      authorNames: authorFallback,
      firstPublishYear: yearFallback,
      coverId: coverFallback,
    })
      .then((data) => {
        if (requestId === requestIdRef.current) setDetail(data);
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setDetail(null);
        setPesanError(
          error instanceof BukuTidakDitemukanError
            ? "Buku tidak ditemukan di Open Library."
            : "Tidak dapat memuat detail buku. Periksa koneksi internet lalu coba lagi.",
        );
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setSedangMemuat(false);
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [
    id,
    titleFallback,
    authorFallback?.join(","),
    yearFallback,
    coverFallback,
    percobaan,
  ]);

  const pageTitle = detail?.title ?? titleFallback ?? "Detail Buku";

  return (
    <>
      <Stack.Screen options={{ title: pageTitle }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 16,
            paddingBottom: 32,
            gap: 20,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              minHeight: 40,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={18} color={colors.accent} />
            <Text style={{ color: colors.accent, fontWeight: "600" }}>
              Kembali ke hasil
            </Text>
          </Pressable>

          {sedangMemuat && (
            <View
              accessibilityRole="progressbar"
              style={{
                minHeight: 240,
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={{ color: colors.textSecondary }}>
                Memuat detail buku...
              </Text>
            </View>
          )}

          {!sedangMemuat && pesanError && (
            <View style={{ gap: 14, paddingVertical: 28 }}>
              <Text style={{ color: colors.danger, fontSize: 15 }}>
                {pesanError}
              </Text>
              {pesanError.includes("Tidak dapat") && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPercobaan((current) => current + 1)}
                  style={({ pressed }) => ({
                    minHeight: 46,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={17}
                    color={colors.backgroundElement}
                  />
                  <Text
                    style={{
                      color: colors.backgroundElement,
                      fontWeight: "700",
                    }}
                  >
                    Coba lagi
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {!sedangMemuat && detail && (
            <View style={{ gap: 22 }}>
              <View style={{ alignItems: "center", gap: 18 }}>
                <SampulDetail
                  coverId={detail.coverId}
                  title={detail.title}
                  colors={colors}
                />
                <View style={{ width: "100%", gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 25,
                      lineHeight: 32,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {detail.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 15,
                      lineHeight: 22,
                      textAlign: "center",
                    }}
                  >
                    {detail.authorNames.join(", ") || "Penulis tidak tersedia"}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundElement,
                }}
              >
                <DetailRow
                  label="Tahun terbit pertama"
                  value={detail.firstPublishYear?.toString()}
                  unavailable="Tahun terbit pertama tidak tersedia"
                  colors={colors}
                />
              </View>

              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 17, fontWeight: "700" }}>
                  Sinopsis
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                >
                  {detail.description || "Tulisan tidak tersedia"}
                </Text>
              </View>

              <View style={{ gap: 2 }}>
                <Text
                  style={{ fontSize: 17, fontWeight: "700", marginBottom: 4 }}
                >
                  Data edisi teratas
                </Text>
                <DetailRow
                  label="Penerbit"
                  value={detail.publishers.join(", ")}
                  unavailable="Penerbit tidak tersedia"
                  colors={colors}
                />
                <DetailRow
                  label="Jumlah halaman"
                  value={
                    detail.pageCount ? `${detail.pageCount} halaman` : undefined
                  }
                  unavailable="Jumlah halaman tidak tersedia"
                  colors={colors}
                />
                <DetailRow
                  label="ISBN"
                  value={detail.isbns.join(", ")}
                  unavailable="ISBN tidak tersedia"
                  colors={colors}
                />
                <DetailRow
                  label="Bahasa"
                  value={detail.languages.join(", ")}
                  unavailable="Bahasa tidak tersedia"
                  colors={colors}
                />
                <DetailRow
                  label="Subjek / kategori"
                  value={detail.subjects.join(", ")}
                  unavailable="Subjek tidak tersedia"
                  colors={colors}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
