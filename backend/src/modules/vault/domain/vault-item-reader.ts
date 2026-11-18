export type VaultItemType = "BOOK" | "MOVIE" | "IMAGE" | "QUOTE" | "LINK";

export interface VaultItemSummary {
  id: string;
  type: VaultItemType;
  title: string;
}

// Porta de leitura do módulo Vault, consumida pelo módulo Collections.
export interface VaultItemReader {
  existsInLibrary(libraryId: string, vaultItemId: string): Promise<boolean>;
  findSummaries(libraryId: string, ids: string[]): Promise<VaultItemSummary[]>;
}

const QUOTE_MAX = 80;

export function displayTitle(item: {
  type: VaultItemType;
  book?: { title: string } | null;
  movie?: { title: string } | null;
  image?: { title: string | null } | null;
  quote?: { content: string } | null;
  link?: { title: string | null; url: string } | null;
}): string {
  switch (item.type) {
    case "BOOK": return item.book?.title ?? "";
    case "MOVIE": return item.movie?.title ?? "";
    case "IMAGE": return item.image?.title ?? "";
    case "QUOTE": {
      const c = item.quote?.content ?? "";
      return c.length > QUOTE_MAX ? `${c.slice(0, QUOTE_MAX - 1)}…` : c;
    }
    case "LINK": return item.link?.title || item.link?.url || "";
  }
}
