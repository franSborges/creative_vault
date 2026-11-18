import { z } from "zod";

const url = z.url({ protocol: /^https?$/ }).max(2048);

export const idParams = z.object({ id: z.uuid() });
export const itemParams = z.object({ id: z.uuid(), itemId: z.uuid() });

export const createCollectionBody = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  coverUrl: url.nullish(),
});

export const updateCollectionBody = createCollectionBody
  .partial()
  .refine((b) => Object.keys(b).length > 0, { message: "Informe ao menos um campo" });

export const addItemBody = z.object({
  vaultItemId: z.uuid(),
  coverUrl: url.nullish(),
  position: z.number().int().min(0).nullish(),
});
