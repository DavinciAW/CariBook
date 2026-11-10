import { BukuOpenLibrary } from "../../types/buku";

const BASE_URL = "https://openlibrary.org/search.json";

interface ResponsPencarianOpenLibrary {
  docs?: unknown;
}

export async function cariBuku(kueri: string): Promise<BukuOpenLibrary[]> {
  const params = new URLSearchParams({
    q: kueri,
    fields: "key,title,author_name,first_publish_year,cover_i,edition_count",
    limit: "20",
  });
  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Open Library mengembalikan status ${response.status}`);
  }

  const data = (await response.json()) as ResponsPencarianOpenLibrary;
  if (!Array.isArray(data.docs)) return [];

  return data.docs.flatMap((item): BukuOpenLibrary[] => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    if (typeof record.title !== "string") return [];

    return [
      {
        key: typeof record.key === "string" ? record.key : undefined,
        title: record.title,
        author_name: Array.isArray(record.author_name)
          ? record.author_name.filter(
              (author): author is string => typeof author === "string",
            )
          : undefined,
        first_publish_year:
          typeof record.first_publish_year === "number" &&
          Number.isFinite(record.first_publish_year)
            ? record.first_publish_year
            : undefined,
        cover_i:
          typeof record.cover_i === "number" &&
          Number.isFinite(record.cover_i) &&
          record.cover_i > 0
            ? record.cover_i
            : undefined,
        edition_count:
          typeof record.edition_count === "number" &&
          Number.isFinite(record.edition_count)
            ? record.edition_count
            : undefined,
      },
    ];
  });
}
