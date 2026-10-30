export enum ReferenceType {
    IMAGE = "IMAGE",
    LINK = "LINK",
    BOOK = "BOOK",
    MOVIE = "MOVIE",
}

export interface Reference {
    id: string;
    title: string;
    type: ReferenceType;
    description?: string;
    url?: string;
    imageUrl?: string;
    author?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreatedReference = Omit<Reference, "id" | "createdAt" | "updatedAt">;