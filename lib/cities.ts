export type CitySearchIndex = {
    n: string;     // Primary Name (Standard English)
    loc: {         // Localized names
        am: string; // Amharic Script
        om: string; // Afaan Oromo / Latin Script
    };
    a: string[];   // Aliases, historical names, & common misspellings
    lat: number;
    lng: number;
};

export const SEARCH_INDEX: CitySearchIndex[] = [
    // --- MAJOR METROS & CHARTER CITIES ---
    { n: "Addis Ababa", loc: { am: "አዲስ አበባ", om: "Finfinne" }, a: ["Addis", "AA", "Sheger", "Finfine", "Adis Abeba"], lat: 9.0054, lng: 38.7636 },
    { n: "Dire Dawa", loc: { am: "ድሬዳዋ", om: "Dirre Dhawaa" }, a: ["Dire Dawa", "Diredawa"], lat: 9.5931, lng: 41.8661 },
    { n: "Adama", loc: { am: "አዳማ", om: "Adaamaa" }, a: ["Nazret", "Nazreth", "Nasret", "Nazareth"], lat: 8.5400, lng: 39.2700 },
    { n: "Bahir Dar", loc: { am: "ባህር ዳር", om: "Bahir Dar" }, a: ["Bahirdar", "Bahr Dar"], lat: 11.5742, lng: 37.3614 },
    { n: "Mekelle", loc: { am: "መቀሌ", om: "Maqalee" }, a: ["Mekele", "Makale", "Maqale"], lat: 13.4967, lng: 39.4767 },
    { n: "Hawassa", loc: { am: "ሀዋሳ", om: "Hawassa" }, a: ["Awassa", "Hawasa"], lat: 7.0622, lng: 38.4763 },
    { n: "Jimma", loc: { am: "ጅማ", om: "Jimmaa" }, a: ["Jima", "Jimma Abba Jifar"], lat: 7.6734, lng: 36.8344 },
    { n: "Gondar", loc: { am: "ጎንደር", om: "Gondar" }, a: ["Gonder", "Begemder"], lat: 12.6000, lng: 37.4667 },
    { n: "Harar", loc: { am: "ሐረር", om: "Harar" }, a: ["Harar Jugol", "Harrar"], lat: 9.3139, lng: 42.1181 },
    { n: "Dessie", loc: { am: "ደሴ", om: "Dessie" }, a: ["Dese", "Dessy"], lat: 11.1167, lng: 39.6333 },
    { n: "Jijiga", loc: { am: "ጅጅጋ", om: "Jijiga" }, a: ["Jigjiga"], lat: 9.3500, lng: 42.8000 },
    
    // --- CENTRAL & SHOA REGION ---
    { n: "Bishoftu", loc: { am: "ቢሾፍቱ", om: "Bishooftu" }, a: ["Debre Zeyit", "Debre Zeit", "Debre Zayit"], lat: 8.7500, lng: 38.9833 },
    { n: "Debre Birhan", loc: { am: "ደብረ ብርሃን", om: "Debre Birhan" }, a: ["Debre Berhan"], lat: 9.6833, lng: 39.5333 },
    { n: "Ambo", loc: { am: "አምቦ", om: "Ambo" }, a: ["Hagere Hiwot"], lat: 8.9833, lng: 37.8500 },
    { n: "Sebeta", loc: { am: "ሰበታ", om: "Sabbataa" }, a: ["Sabata"], lat: 8.9167, lng: 38.6167 },
    { n: "Burayu", loc: { am: "ቡራዩ", om: "Burraayyuu" }, a: ["Burayo"], lat: 9.0500, lng: 38.6500 },
    { n: "Holeta", loc: { am: "ሆለታ", om: "Holota" }, a: ["Holeta Genet", "Oolotaa"], lat: 9.0500, lng: 38.5000 },
    { n: "Waliso", loc: { am: "ወሊሶ", om: "Walisoo" }, a: ["Woliso", "Ghion", "Giyon"], lat: 8.5333, lng: 37.9667 },
    { n: "Fiche", loc: { am: "ፍቼ", om: "Fiichee" }, a: ["Fiche", "Selale"], lat: 9.7833, lng: 38.7333 },
    { n: "Modjo", loc: { am: "ሞጆ", om: "Mojoo" }, a: ["Mojo"], lat: 8.5833, lng: 39.1167 },
    { n: "Dukem", loc: { am: "ዱከም", om: "Dukam" }, a: ["Dukem"], lat: 8.8000, lng: 38.9000 },
    { n: "Gelan", loc: { am: "ገላን", om: "Gallan" }, a: ["Galan"], lat: 8.8333, lng: 38.8667 },
    { n: "Sululta", loc: { am: "ሱሉልታ", om: "Sulultaa" }, a: [], lat: 9.1833, lng: 38.7500 },
    { n: "Legetafo", loc: { am: "ለገጣፎ", om: "Laga Xaafoo" }, a: ["Legedadi"], lat: 9.0667, lng: 38.8667 },
    { n: "Sendafa", loc: { am: "ሰንዳፋ", om: "Sandafaa" }, a: ["Sendafa Beke"], lat: 9.1500, lng: 39.0333 },
    { n: "Shewa Robit", loc: { am: "ሸዋ ሮቢት", om: "Shewa Robit" }, a: ["Shoa Robit", "Kewet"], lat: 10.0125, lng: 39.8944 },
    { n: "Ataye", loc: { am: "አጣዬ", om: "Ataye" }, a: ["Efeson"], lat: 10.3500, lng: 39.9333 },

    // --- OROMIA (EAST/WEST/SOUTH) ---
    { n: "Shashemene", loc: { am: "ሻሸመኔ", om: "Shaashamannee" }, a: ["Shashemene"], lat: 7.2000, lng: 38.6000 },
    { n: "Nekemte", loc: { am: "ነቀምቴ", om: "Naqamte" }, a: ["Nekemte"], lat: 9.0833, lng: 36.5500 },
    { n: "Asella", loc: { am: "አሰላ", om: "Asallaa" }, a: ["Asela"], lat: 7.9500, lng: 39.1167 },
    { n: "Batu", loc: { am: "ባቱ", om: "Batu" }, a: ["Ziway", "Zway", "Zeway"], lat: 7.9333, lng: 38.7167 },
    { n: "Bule Hora", loc: { am: "ቡሌ ሆራ", om: "Bulee Horaa" }, a: ["Hagere Mariam", "Hagere Maryam"], lat: 5.6333, lng: 38.2333 },
    { n: "Robe", loc: { am: "ሮቤ", om: "Roobee" }, a: ["Bale Robe"], lat: 7.1167, lng: 40.0000 },
    { n: "Goba", loc: { am: "ጎባ", om: "Gobba" }, a: [], lat: 7.0000, lng: 39.9833 },
    { n: "Jimma", loc: { am: "ጅማ", om: "Jimmaa" }, a: [], lat: 7.6667, lng: 36.8333 },
    { n: "Agaro", loc: { am: "አጋሮ", om: "Aggaaro" }, a: ["Hagaro"], lat: 7.8500, lng: 36.6500 },
    { n: "Bedele", loc: { am: "በደሌ", om: "Baddallee" }, a: ["Bedelle"], lat: 8.4500, lng: 36.3500 },
    { n: "Metu", loc: { am: "መቱ", om: "Mattuu" }, a: ["Metu"], lat: 8.3000, lng: 35.5833 },
    { n: "Dembidolo", loc: { am: "ደምቢዶሎ", om: "Dambi Dolo" }, a: ["Dembi Dolo"], lat: 8.5333, lng: 34.8000 },
    { n: "Gimbi", loc: { am: "ጊምቢ", om: "Giimbii" }, a: ["Ghimbi"], lat: 9.1667, lng: 35.8333 },
    { n: "Nedjo", loc: { am: "ነጆ", om: "Najjo" }, a: ["Nejo"], lat: 9.5000, lng: 35.4500 },
    { n: "Shambu", loc: { am: "ሻምቡ", om: "Shaambuu" }, a: [], lat: 9.5667, lng: 37.1000 },
    { n: "Meki", loc: { am: "መቂ", om: "Maqii" }, a: [], lat: 8.1500, lng: 38.8167 },
    { n: "Yabelo", loc: { am: "ያቤሎ", om: "Yaaballo" }, a: ["Yabello"], lat: 4.8833, lng: 38.0833 },
    { n: "Negele Borana", loc: { am: "ነገሌ ቦረና", om: "Nageellee" }, a: ["Neghelle", "Negele"], lat: 5.3333, lng: 39.5833 },
    { n: "Shakiso", loc: { am: "ሻኪሶ", om: "Shaakiso" }, a: [], lat: 5.7667, lng: 38.9167 },
    { n: "Moyale", loc: { am: "ሞያሌ", om: "Moyyaale" }, a: [], lat: 3.5333, lng: 39.0500 },

    // --- AMHARA REGION ---
    { n: "Debre Markos", loc: { am: "ደብረ ማርቆስ", om: "Debre Markos" }, a: ["Mankorar"], lat: 10.3333, lng: 37.7167 },
    { n: "Kombolcha", loc: { am: "ኮምቦልቻ", om: "Kombolcha" }, a: [], lat: 11.0833, lng: 39.7333 },
    { n: "Woldia", loc: { am: "ወልድያ", om: "Woldia" }, a: ["Weldiya"], lat: 11.8333, lng: 39.6000 },
    { n: "Debre Tabor", loc: { am: "ደብረ ታቦር", om: "Debre Tabor" }, a: [], lat: 11.8500, lng: 38.0167 },
    { n: "Finote Selam", loc: { am: "ፍኖተ ሰላም", om: "Finote Selam" }, a: [], lat: 10.7000, lng: 37.2667 },
    { n: "Motta", loc: { am: "ሞጣ", om: "Motta" }, a: ["Mota"], lat: 11.0833, lng: 37.8833 },
    { n: "Injibara", loc: { am: "እንጅባራ", om: "Injibara" }, a: ["Kosober"], lat: 10.9500, lng: 36.9333 },
    { n: "Dangila", loc: { am: "ዳንግላ", om: "Dangila" }, a: [], lat: 11.2500, lng: 36.8333 },
    { n: "Chagni", loc: { am: "ቻግኒ", om: "Chagni" }, a: [], lat: 10.9500, lng: 36.5000 },
    { n: "Metemma", loc: { am: "መተማ", om: "Metemma" }, a: ["Metema", "Yohannes"], lat: 12.9667, lng: 36.1500 },
    { n: "Kobo", loc: { am: "ቆቦ", om: "Kobo" }, a: ["Raya Kobo"], lat: 12.1500, lng: 39.6333 },
    { n: "Haik", loc: { am: "ሀይቅ", om: "Hayq" }, a: ["Hayq"], lat: 11.3000, lng: 39.6833 },
    { n: "Kemise", loc: { am: "ከሚሴ", om: "Kemise" }, a: [], lat: 10.7167, lng: 39.8667 },
    { n: "Bati", loc: { am: "ባቲ", om: "Bati" }, a: [], lat: 11.1833, lng: 40.0167 },
    { n: "Lalibela", loc: { am: "ላሊበላ", om: "Lalibela" }, a: ["Roha"], lat: 12.0333, lng: 39.0333 },

    // --- TIGRAY REGION ---
    { n: "Shire", loc: { am: "ሽሬ", om: "Shire" }, a: ["Inda Selassie", "Endaselassie"], lat: 14.1000, lng: 38.2833 },
    { n: "Axum", loc: { am: "አክሱም", om: "Aksum" }, a: ["Aksum"], lat: 14.1228, lng: 38.7278 },
    { n: "Adigrat", loc: { am: "ዓዲግራት", om: "Adigrat" }, a: [], lat: 14.2833, lng: 39.4667 },
    { n: "Alamata", loc: { am: "አላማጣ", om: "Alamata" }, a: [], lat: 12.4167, lng: 39.5500 },
    { n: "Maychew", loc: { am: "ማይጨው", om: "Maychew" }, a: ["Maichew"], lat: 12.7833, lng: 39.5333 },
    { n: "Wukro", loc: { am: "ውቅሮ", om: "Wukro" }, a: [], lat: 13.7833, lng: 39.6000 },
    { n: "Humera", loc: { am: "ሁመራ", om: "Humera" }, a: ["Himora"], lat: 14.3000, lng: 36.6167 },
    { n: "Adwa", loc: { am: "አድዋ", om: "Adwa" }, a: ["Adua"], lat: 14.1667, lng: 38.9000 },

    // --- SIDAMA & SOUTH (SNNPR/SWEPR) ---
    { n: "Arba Minch", loc: { am: "አርባ ምንጭ", om: "Arba Minch" }, a: ["Arbaminch", "Gantar"], lat: 6.0333, lng: 37.5500 },
    { n: "Sodo", loc: { am: "ሶዶ", om: "Sodo" }, a: ["Wolaita Sodo", "Wolayta Sodo"], lat: 6.8667, lng: 37.7667 },
    { n: "Hosaena", loc: { am: "ሆሳእና", om: "Hosaena" }, a: ["Hossana", "Hosana"], lat: 7.5500, lng: 37.8500 },
    { n: "Dilla", loc: { am: "ዲላ", om: "Dilla" }, a: [], lat: 6.4083, lng: 38.3083 },
    { n: "Yirgalem", loc: { am: "ይርጋለም", om: "Yirgalem" }, a: ["Abosto"], lat: 6.7500, lng: 38.4167 },
    { n: "Aleta Wendo", loc: { am: "አለታ ወንዶ", om: "Aleta Wendo" }, a: [], lat: 6.6000, lng: 38.4167 },
    { n: "Butajira", loc: { am: "ቡታጅራ", om: "Butajira" }, a: [], lat: 8.1167, lng: 38.3667 },
    { n: "Welkite", loc: { am: "ወልቂጤ", om: "Welkite" }, a: ["Wolkite", "Walkite"], lat: 8.2833, lng: 37.7833 },
    { n: "Worabe", loc: { am: "ወራቤ", om: "Worabe" }, a: ["Warabe"], lat: 7.8333, lng: 38.2000 },
    { n: "Durame", loc: { am: "ዱራሜ", om: "Durame" }, a: [], lat: 7.2333, lng: 37.8833 },
    { n: "Halaba Kulito", loc: { am: "ሀላባ", om: "Halaba" }, a: ["Alaba Kulito", "Kulito"], lat: 7.3000, lng: 38.0833 },
    { n: "Sawla", loc: { am: "ሳውላ", om: "Sawla" }, a: ["Felege Neway"], lat: 6.3000, lng: 36.8833 },
    { n: "Jinka", loc: { am: "ጂንካ", om: "Jinka" }, a: [], lat: 5.6500, lng: 36.5667 },
    { n: "Konso", loc: { am: "ኮንሶ", om: "Konso" }, a: ["Karat", "Pakawle"], lat: 5.2667, lng: 37.4833 },
    { n: "Mizan Teferi", loc: { am: "ሚዛን ተፈሪ", om: "Mizan Teferi" }, a: ["Mizan Aman"], lat: 6.9833, lng: 35.5833 },
    { n: "Tepi", loc: { am: "ቴፒ", om: "Tepi" }, a: [], lat: 7.2000, lng: 35.4500 },
    { n: "Bonga", loc: { am: "ቦንጋ", om: "Bonga" }, a: [], lat: 7.2667, lng: 36.2333 },
    
    // --- SOMALI REGION ---
    { n: "Gode", loc: { am: "ጎዴ", om: "Gode" }, a: ["Godey"], lat: 5.9500, lng: 43.5500 },
    { n: "Degehabur", loc: { am: "ደገህ ቡር", om: "Dhagaxbuur" }, a: ["Degeh Bur"], lat: 8.2167, lng: 43.5667 },
    { n: "Kebri Dahar", loc: { am: "ቀብሪ ደሀር", om: "Qabridahar" }, a: ["Qabri Dahar"], lat: 6.7333, lng: 44.2667 },
    { n: "Werder", loc: { am: "ወርደር", om: "Wardheer" }, a: ["Wardher"], lat: 6.9667, lng: 45.3333 },
    { n: "Filtu", loc: { am: "ፊልቱ", om: "Filtu" }, a: [], lat: 5.1167, lng: 40.6500 },
    { n: "Wajaale", loc: { am: "ቶጎ ጫሌ", om: "Togo Chale" }, a: ["Tog Wajaale", "Togo Wuchale"], lat: 9.6000, lng: 43.3333 },

    // --- AFAR REGION ---
    { n: "Semera", loc: { am: "ሰመራ", om: "Samara" }, a: ["Semara"], lat: 11.7944, lng: 41.0064 },
    { n: "Logia", loc: { am: "ሎጊያ", om: "Logia" }, a: [], lat: 11.7333, lng: 40.9667 },
    { n: "Dubti", loc: { am: "ዱብቲ", om: "Dubti" }, a: [], lat: 11.7333, lng: 41.0833 },
    { n: "Awash", loc: { am: "አዋሽ", om: "Awash" }, a: ["Awash Sebat", "Awash 7"], lat: 8.9833, lng: 40.1667 },
    { n: "Gewane", loc: { am: "ገዋኔ", om: "Gewane" }, a: [], lat: 10.1667, lng: 40.6500 },
    { n: "Asaita", loc: { am: "አሳይታ", om: "Asaita" }, a: ["Asayita"], lat: 11.5667, lng: 41.4333 },

    // --- GAMBELLA & BENISHANGUL ---
    { n: "Gambella", loc: { am: "ጋምቤላ", om: "Gambella" }, a: ["Gambela"], lat: 8.2500, lng: 34.5833 },
    { n: "Asosa", loc: { am: "አሶሳ", om: "Asosa" }, a: ["Assosa"], lat: 10.0667, lng: 34.5333 },
    { n: "Metekel", loc: { am: "መተከል", om: "Metekel" }, a: ["Gilgil Beles"], lat: 11.0500, lng: 36.3333 }, // Often ref by zone/capital Gilgil Beles

    // --- ADDITIONAL STRATEGIC TOWNS ---
    { n: "Alem Tena", loc: { am: "አለም ጤና", om: "Alem Tena" }, a: [], lat: 8.3000, lng: 38.9500 },
    { n: "Huruta", loc: { am: "ሁሩታ", om: "Huruta" }, a: [], lat: 8.1500, lng: 39.3500 },
    { n: "Ginchi", loc: { am: "ጊንጪ", om: "Ginci" }, a: [], lat: 9.0333, lng: 38.1500 },
    { n: "Gebre Guracha", loc: { am: "ገብረ ጉራቻ", om: "Gabra Gurraacha" }, a: [], lat: 9.8000, lng: 38.4000 },
    { n: "Chancho", loc: { am: "ጫንጮ", om: "Caanco" }, a: [], lat: 9.3000, lng: 38.7500 },
    { n: "Muketuri", loc: { am: "ሙከጡሪ", om: "Muka Turi" }, a: [], lat: 9.5500, lng: 38.8667 },
    { n: "Bishoftu (Babogaya)", loc: { am: "ባቦጋያ", om: "Babogaya" }, a: [], lat: 8.7667, lng: 38.9833 }, // Distinct area search aid
    { n: "Indibir", loc: { am: "እንድብር", om: "Indibir" }, a: [], lat: 8.1333, lng: 37.9333 },
    { n: "Agena", loc: { am: "አገና", om: "Agena" }, a: [], lat: 8.0833, lng: 38.0167 }
];