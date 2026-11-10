export interface DetailBukuOpenLibrary {
  title: string;
  authorNames: string[];
  firstPublishYear?: number;
  coverId?: number;
  description?: string;
  publishers: string[];
  pageCount?: number;
  isbns: string[];
  languages: string[];
  subjects: string[];
}

export interface FallbackDetailBuku {
  title?: string;
  authorNames?: string[];
  firstPublishYear?: number;
  coverId?: number;
}
