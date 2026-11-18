export interface Collection {
  id: string;
  libraryId: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  vaultItemId: string;
  coverUrl: string | null;
  position: number | null;
  createdAt: Date;
}

export interface CreateCollectionData {
  libraryId: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
}

export type UpdateCollectionData = Partial<Pick<Collection, "name" | "description" | "coverUrl">>;

export interface CollectionRepository {
  listByLibrary(libraryId: string): Promise<Collection[]>;
  findById(libraryId: string, id: string): Promise<Collection | null>;
  create(data: CreateCollectionData): Promise<Collection>;
  update(id: string, data: UpdateCollectionData): Promise<Collection>;
  delete(id: string): Promise<void>; 
  listItems(collectionId: string): Promise<CollectionItem[]>; 
  findItem(collectionId: string, vaultItemId: string): Promise<CollectionItem | null>;
  maxPosition(collectionId: string): Promise<number | null>;
  addItem(data: { collectionId: string; vaultItemId: string; coverUrl: string | null; position: number }): Promise<CollectionItem>; // lança DuplicateError
  removeItem(collectionId: string, vaultItemId: string): Promise<void>;
}
