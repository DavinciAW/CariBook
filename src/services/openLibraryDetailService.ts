import {
  DetailBukuOpenLibrary,
  FallbackDetailBuku,
} from "../../types/detailBuku";

const BASE_URL = "https://openlibrary.org";

interface RecordData {
  [key: string]: unknown;
}

export class BukuTidakDitemukanError extends Error {
  constructor() {
    super("Buku tidak ditemukan di Open Library.");
    this.name = "BukuTidakDitemukanError";
  }
}

function isRecord(value: unknown): value is RecordData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function descriptionText(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (
    isRecord(value) &&
    typeof value.value === "string" &&
    value.value.trim()
  ) {
    return value.value.trim();
  }
  return undefined;
}

function positiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function yearFromDate(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const year = value.match(/\b\d{4}\b/)?.[0];
  return year ? Number(year) : undefined;
}

function languageNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const knownLanguages: Record<string, string> = {
    ara: "Arab",
    chi: "Mandarin",
    deu: "Jerman",
    eng: "Inggris",
    fas: "Persia",
    fra: "Prancis",
    fre: "Prancis",
    ind: "Indonesia",
    ita: "Italia",
    jpn: "Jepang",
    may: "Melayu",
    rus: "Rusia",
    spa: "Spanyol",
  };

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.key !== "string") return [];
    const code = item.key.split("/").filter(Boolean).at(-1);
    if (!code) return [];
    return [knownLanguages[code] ?? code.toUpperCase()];
  });
}

async function ambilJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (response.status === 404) throw new BukuTidakDitemukanError();
  if (!response.ok) {
    throw new Error(`Open Library mengembalikan status ${response.status}`);
  }
  return response.json();
}

async function namaPenulisDariKunci(keys: string[]): Promise<string[]> {
  const uniqueKeys = [...new Set(keys)].slice(0, 5);
  const results = await Promise.all(
    uniqueKeys.map(async (key) => {
      if (!/^\/authors\/[^/]+$/.test(key)) return undefined;
      try {
        const data = await ambilJson(`${BASE_URL}${key}.json`);
        return isRecord(data) && typeof data.name === "string"
          ? data.name
          : undefined;
      } catch {
        return undefined;
      }
    }),
  );
  return results.filter((name): name is string => Boolean(name));
}

export async function ambilDetailBuku(
  workId: string,
  fallback: FallbackDetailBuku = {},
): Promise<DetailBukuOpenLibrary> {
  if (!/^[A-Za-z0-9_-]+$/.test(workId)) throw new BukuTidakDitemukanError();

  const [workValue, editionsValue] = await Promise.all([
    ambilJson(`${BASE_URL}/works/${encodeURIComponent(workId)}.json`),
    ambilJson(
      `${BASE_URL}/works/${encodeURIComponent(workId)}/editions.json?limit=10`,
    ),
  ]);

  if (!isRecord(workValue)) throw new BukuTidakDitemukanError();
  const work = workValue;
  const editions =
    isRecord(editionsValue) && Array.isArray(editionsValue.entries)
      ? editionsValue.entries.filter(isRecord)
      : [];
  const edition = editions[0];

  const authorKeys = Array.isArray(work.authors)
    ? work.authors.flatMap((entry) => {
        if (!isRecord(entry) || !isRecord(entry.author)) return [];
        return typeof entry.author.key === "string" ? [entry.author.key] : [];
      })
    : [];
  const authorNames = await namaPenulisDariKunci(authorKeys);
  const coverIds = Array.isArray(work.covers)
    ? work.covers
        .map(positiveNumber)
        .filter((cover): cover is number => cover !== undefined)
    : [];
  const title = typeof work.title === "string" ? work.title : fallback.title;
  const description = descriptionText(work.description);

  if (!title) throw new BukuTidakDitemukanError();

  const editionLanguages = languageNames(edition?.languages);
  const editionIsbns = [
    ...stringList(edition?.isbn_13),
    ...stringList(edition?.isbn_10),
  ];
  const pageCount = positiveNumber(edition?.number_of_pages);

  return {
    title,
    authorNames:
      authorNames.length > 0 ? authorNames : (fallback.authorNames ?? []),
    firstPublishYear:
      fallback.firstPublishYear ?? yearFromDate(work.first_publish_date),
    coverId: fallback.coverId ?? coverIds[0],
    description,
    publishers: stringList(edition?.publishers),
    pageCount,
    isbns: [...new Set(editionIsbns)],
    languages: editionLanguages,
    subjects: stringList(work.subjects),
  };
}
