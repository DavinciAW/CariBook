import { BukuOpenLibrary } from "../../types/buku";

const BASE_URL = "https://openlibrary.org/search.json";

interface ResponsPencarianOpenLibrary {
  docs?: BukuOpenLibrary[];
}

export async function cariBuku(kueri: string): Promise<BukuOpenLibrary[]> {
  const params = new URLSearchParams({
    q: kueri,
    fields: "key,title,author_name",
    limit: "20",
  });
  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Open Library mengembalikan status ${response.status}`);
  }

  const data = (await response.json()) as ResponsPencarianOpenLibrary;
  return Array.isArray(data.docs)
    ? data.docs.filter((buku) => typeof buku.title === "string")
    : [];
}
