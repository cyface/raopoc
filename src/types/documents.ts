import { z } from 'zod';

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
  required: z.boolean(),
  category: z.enum(['terms', 'privacy', 'disclosure', 'agreement', 'notice']),
});

export const DocumentRuleSchema = z.object({
  productTypes: z.array(z.string()).optional(),
  hasSSN: z.boolean().optional(),
  noSSN: z.boolean().optional(),
  documentIds: z.array(z.string()),
});

export const DocumentConfigSchema = z.object({
  showAcceptAllButton: z.boolean().default(true),
  documents: z.array(DocumentSchema),
  rules: z.array(DocumentRuleSchema),
});

export const DocumentAcceptanceSchema = z.object({
  documentId: z.string(),
  accepted: z.boolean(),
  acceptedAt: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentRule = z.infer<typeof DocumentRuleSchema>;
export type DocumentConfig = z.infer<typeof DocumentConfigSchema>;
export type DocumentAcceptance = z.infer<typeof DocumentAcceptanceSchema>;

export interface DocumentAcceptanceState {
  acceptances: Record<string, DocumentAcceptance>;
  allAccepted: boolean;
}