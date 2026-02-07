export type EmergencyBagItem = {
    itemName_en: string;
    itemName_am: string;
    itemName_or: string;
    category: string;
    isEssential: boolean;
    sortOrder: number;
}

export const ESSENTIAL_ITEMS = [
  {
    itemName_en: "National / Kebele ID",
    itemName_am: "የቀበሌ መታወቂያ",
    itemName_or: "Waraqaa Eenyummaa",
    category: "docs",
    isEssential: true,
    sortOrder: 1
  },
  {
    itemName_en: "Birth Certificates (Self/Children)",
    itemName_am: "የልደት ምስክር ወረቀቶች",
    itemName_or: "Waraqaa Ragaa Dhalootaa",
    category: "docs",
    isEssential: true,
    sortOrder: 2
  },
  {
    itemName_en: "Emergency Cash (24-48h)",
    itemName_am: "የአደጋ ጊዜ ገንዘብ",
    itemName_or: "Maallaqa Hatattamaa",
    category: "cash",
    isEssential: true,
    sortOrder: 3
  },
  {
    itemName_en: "Spare House/Car Keys",
    itemName_am: "ተጨማሪ ቁልፎች",
    itemName_or: "Furtuu Dabalataa",
    category: "personal",
    isEssential: true,
    sortOrder: 4
  },
  {
    itemName_en: "Prescription Medications",
    itemName_am: "መድሃኒቶች",
    itemName_or: "Qoricha Ajaja Doctoraa",
    category: "medical",
    isEssential: true,
    sortOrder: 5
  },
  {
    itemName_en: "Phone Charger & Powerbank",
    itemName_am: "የስልክ ቻርጀር እና ፓወር ባንክ",
    itemName_or: "Chaarjarii fi Paaworbankii",
    category: "personal",
    isEssential: true,
    sortOrder: 6
  },
  {
    itemName_en: "Marriage Certificate",
    itemName_am: "የጋብቻ ምስክር ወረቀት",
    itemName_or: "Waraqaa Ragaa Gaa'elaa",
    category: "docs",
    isEssential: false,
    sortOrder: 7
  }
];