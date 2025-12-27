import * as v from 'valibot';

// 1. Support Directory Schema
export const SupportDirectorySchema = v.object({
  name: v.string(),
  category: v.picklist(['shelter', 'legal', 'medical', 'counseling', 'hotline']),
  phone: v.pipe(v.string(), v.minLength(10)),
  location: v.string(),
  address: v.optional(v.string()),
  description_am: v.string(), // Amharic
  description_en: v.string(), // English
  description_or: v.string(), // Oromifa
  verified: v.boolean(),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),
});

// 2. Evidence Metadata Schema
export const EvidenceMetadataSchema = v.object({
  userId: v.string(),
  fileId: v.string(),
  incidentType: v.picklist(['physical', 'emotional', 'financial', 'sexual', 'other']),
  description: v.pipe(v.string(), v.maxLength(2000)),
  timestamp: v.string(), // ISO String
  isArchived: v.optional(v.boolean()),
  threatLevel: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(5))),
});

export type SupportDirectory = v.InferOutput<typeof SupportDirectorySchema>;
export type EvidenceMetadata = v.InferOutput<typeof EvidenceMetadataSchema>;