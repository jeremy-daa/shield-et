import { Models } from "appwrite";

export interface SupportResource extends Models.Document {
  name: string;
  category: 'shelter' | 'legal' | 'medical' | 'counseling' | 'hotline';
  phone: string;
  location: string;
  address?: string;
  description_am: string;
  description_en: string;
  description_or: string;
  verified: boolean;
  lat?: number;
  lng?: number;
}
