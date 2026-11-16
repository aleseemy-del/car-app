// ماركات الإطارات والبطاريات والزيوت المنتشرة في الكويت — المستخدم يقدر يكتب غيرها
export type PartBrand = { id: string; en: string; ar: string; models: string[] };
export type PartKind = 'tires' | 'battery' | 'oil';

export const PART_BRANDS: Record<PartKind, PartBrand[]> = {
 "tires": [
  {
   "id": "michelin",
   "en": "Michelin",
   "ar": "ميشلان",
   "models": [
    "Pilot Sport 5",
    "Pilot Sport 4",
    "Pilot Sport 4 SUV",
    "Primacy 4+",
    "Primacy SUV+",
    "CrossClimate 2",
    "Energy XM2+",
    "LTX A/T2",
    "Defender LTX M/S"
   ]
  },
  {
   "id": "bridgestone",
   "en": "Bridgestone",
   "ar": "بريجستون",
   "models": [
    "Potenza Sport",
    "Turanza T005",
    "Turanza 6",
    "Alenza 001",
    "Dueler H/T 684",
    "Dueler A/T 002",
    "Ecopia EP300"
   ]
  },
  {
   "id": "continental",
   "en": "Continental",
   "ar": "كونتيننتال",
   "models": [
    "SportContact 7",
    "PremiumContact 7",
    "PremiumContact 6",
    "EcoContact 6",
    "CrossContact LX2",
    "CrossContact ATR"
   ]
  },
  {
   "id": "pirelli",
   "en": "Pirelli",
   "ar": "بيريلي",
   "models": [
    "P Zero",
    "Cinturato P7",
    "Powergy",
    "Scorpion Verde",
    "Scorpion Zero",
    "Scorpion ATR",
    "Scorpion AT Plus"
   ]
  },
  {
   "id": "goodyear",
   "en": "Goodyear",
   "ar": "جوديير",
   "models": [
    "Eagle F1 Asymmetric 6",
    "Eagle F1 Asymmetric 5",
    "EfficientGrip Performance 2",
    "Assurance",
    "Wrangler AT Adventure",
    "Wrangler Territory HT"
   ]
  },
  {
   "id": "yokohama",
   "en": "Yokohama",
   "ar": "يوكوهاما",
   "models": [
    "Advan Sport V107",
    "Advan dB",
    "BluEarth-GT",
    "Geolandar A/T G015",
    "Geolandar H/T G056",
    "Geolandar X-CV"
   ]
  },
  {
   "id": "dunlop",
   "en": "Dunlop",
   "ar": "دنلوب",
   "models": [
    "SP Sport Maxx 060",
    "Sport Maxx RT2",
    "Grandtrek PT5",
    "Grandtrek AT5",
    "Grandtrek AT25"
   ]
  },
  {
   "id": "hankook",
   "en": "Hankook",
   "ar": "هانكوك",
   "models": [
    "Ventus S1 evo3",
    "Ventus Prime 4",
    "Kinergy GT",
    "Dynapro HP2",
    "Dynapro AT2"
   ]
  },
  {
   "id": "toyo",
   "en": "Toyo",
   "ar": "تويو",
   "models": [
    "Proxes Sport",
    "Proxes CF2",
    "Open Country A/T III",
    "Open Country H/T",
    "Open Country R/T"
   ]
  },
  {
   "id": "bfgoodrich",
   "en": "BFGoodrich",
   "ar": "بي إف جودريتش",
   "models": [
    "All-Terrain T/A KO2",
    "All-Terrain T/A KO3",
    "Mud-Terrain T/A KM3",
    "Trail-Terrain T/A",
    "Advantage Touring"
   ]
  },
  {
   "id": "kumho",
   "en": "Kumho",
   "ar": "كومهو",
   "models": [
    "Ecsta PS71",
    "Solus TA31",
    "Crugen HP71",
    "Road Venture AT51"
   ]
  },
  {
   "id": "falken",
   "en": "Falken",
   "ar": "فالكن",
   "models": [
    "Azenis FK520",
    "Ziex ZE310",
    "Wildpeak A/T3W"
   ]
  },
  {
   "id": "nexen",
   "en": "Nexen",
   "ar": "نكسن",
   "models": [
    "N'Fera Sport",
    "N'Priz AH8",
    "Roadian HTX2",
    "Roadian ATX"
   ]
  },
  {
   "id": "nitto",
   "en": "Nitto",
   "ar": "نيتو",
   "models": [
    "NT555 G2",
    "Terra Grappler G2",
    "Ridge Grappler",
    "Recon Grappler"
   ]
  },
  {
   "id": "cooper",
   "en": "Cooper",
   "ar": "كوبر",
   "models": [
    "Discoverer AT3",
    "Discoverer HTP",
    "Zeon RS3-G1"
   ]
  },
  {
   "id": "firestone",
   "en": "Firestone",
   "ar": "فايرستون",
   "models": [
    "Firehawk",
    "Destination A/T2",
    "Destination LE3"
   ]
  },
  {
   "id": "general",
   "en": "General Tire",
   "ar": "جنرال تاير",
   "models": [
    "Grabber AT3",
    "Grabber HTS60",
    "Altimax"
   ]
  },
  {
   "id": "maxxis",
   "en": "Maxxis",
   "ar": "ماكسس",
   "models": [
    "Victra Sport 5",
    "Bravo HP-M3",
    "Razr AT"
   ]
  },
  {
   "id": "gtradial",
   "en": "GT Radial",
   "ar": "جي تي راديال",
   "models": [
    "Champiro",
    "Savero"
   ]
  },
  {
   "id": "giti",
   "en": "Giti",
   "ar": "جيتي",
   "models": [
    "GitiSport",
    "GitiComfort"
   ]
  },
  {
   "id": "triangle",
   "en": "Triangle",
   "ar": "ترايانجل",
   "models": []
  },
  {
   "id": "sailun",
   "en": "Sailun",
   "ar": "سايلون",
   "models": []
  },
  {
   "id": "linglong",
   "en": "Linglong",
   "ar": "لينجلونج",
   "models": []
  },
  {
   "id": "westlake",
   "en": "Westlake",
   "ar": "ويستليك",
   "models": []
  },
  {
   "id": "kenda",
   "en": "Kenda",
   "ar": "كيندا",
   "models": []
  },
  {
   "id": "achilles",
   "en": "Achilles",
   "ar": "أكيليس",
   "models": []
  }
 ],
 "battery": [
  {
   "id": "varta",
   "en": "Varta",
   "ar": "فارتا",
   "models": [
    "Silver Dynamic",
    "Blue Dynamic",
    "Silver Dynamic AGM",
    "Blue Dynamic EFB"
   ]
  },
  {
   "id": "bosch",
   "en": "Bosch",
   "ar": "بوش",
   "models": [
    "S4",
    "S5",
    "S5 AGM",
    "S6 AGM"
   ]
  },
  {
   "id": "acdelco",
   "en": "ACDelco",
   "ar": "إيه سي ديلكو",
   "models": [
    "Professional Gold",
    "Advantage"
   ]
  },
  {
   "id": "amaron",
   "en": "Amaron",
   "ar": "أمارون",
   "models": [
    "Hi-Life",
    "Pro",
    "Go"
   ]
  },
  {
   "id": "hankook",
   "en": "Hankook (AtlasBX)",
   "ar": "هانكوك",
   "models": [
    "MF",
    "AGM",
    "EFB"
   ]
  },
  {
   "id": "rocket",
   "en": "Rocket",
   "ar": "روكيت",
   "models": [
    "SMF",
    "EFB",
    "AGM"
   ]
  },
  {
   "id": "solite",
   "en": "Solite",
   "ar": "سولايت",
   "models": [
    "CMF",
    "EFB",
    "AGM"
   ]
  },
  {
   "id": "delkor",
   "en": "Delkor",
   "ar": "ديلكور",
   "models": [
    "MF",
    "AGM"
   ]
  },
  {
   "id": "gsyuasa",
   "en": "GS Yuasa",
   "ar": "جي إس يواسا",
   "models": [
    "MF",
    "EFB",
    "AGM"
   ]
  },
  {
   "id": "panasonic",
   "en": "Panasonic",
   "ar": "باناسونيك",
   "models": [
    "Caos",
    "Blue Battery"
   ]
  },
  {
   "id": "exide",
   "en": "Exide",
   "ar": "إكسايد",
   "models": [
    "Premium",
    "Excell",
    "AGM"
   ]
  },
  {
   "id": "optima",
   "en": "Optima",
   "ar": "أوبتيما",
   "models": [
    "RedTop",
    "YellowTop",
    "BlueTop"
   ]
  },
  {
   "id": "motorcraft",
   "en": "Motorcraft",
   "ar": "موتوركرافت",
   "models": [
    "Tested Tough",
    "AGM"
   ]
  },
  {
   "id": "toyota",
   "en": "Toyota Genuine",
   "ar": "تويوتا أصلي",
   "models": []
  },
  {
   "id": "original",
   "en": "Original (OEM)",
   "ar": "أصلي من الوكالة",
   "models": []
  }
 ],
 "oil": [
  {
   "id": "mobil",
   "en": "Mobil",
   "ar": "موبيل",
   "models": [
    "Mobil 1",
    "Mobil Super",
    "Mobil Delvac"
   ]
  },
  {
   "id": "castrol",
   "en": "Castrol",
   "ar": "كاسترول",
   "models": [
    "EDGE",
    "MAGNATEC",
    "GTX"
   ]
  },
  {
   "id": "shell",
   "en": "Shell",
   "ar": "شل",
   "models": [
    "Helix Ultra",
    "Helix HX8",
    "Helix HX7",
    "Rimula"
   ]
  },
  {
   "id": "total",
   "en": "TotalEnergies",
   "ar": "توتال",
   "models": [
    "Quartz 9000",
    "Quartz INEO",
    "Quartz 7000"
   ]
  },
  {
   "id": "valvoline",
   "en": "Valvoline",
   "ar": "فالفولين",
   "models": [
    "SynPower",
    "MaxLife",
    "Premium Blue"
   ]
  },
  {
   "id": "motul",
   "en": "Motul",
   "ar": "موتول",
   "models": [
    "8100",
    "6100",
    "H-Tech"
   ]
  },
  {
   "id": "liquimoly",
   "en": "Liqui Moly",
   "ar": "ليكوي مولي",
   "models": [
    "Top Tec",
    "Special Tec",
    "Molygen"
   ]
  },
  {
   "id": "pennzoil",
   "en": "Pennzoil",
   "ar": "بينزويل",
   "models": [
    "Ultra Platinum",
    "Platinum"
   ]
  },
  {
   "id": "toyotaoil",
   "en": "Toyota Genuine",
   "ar": "تويوتا أصلي",
   "models": []
  },
  {
   "id": "nissanoil",
   "en": "Nissan Genuine",
   "ar": "نيسان أصلي",
   "models": []
  },
  {
   "id": "gmoil",
   "en": "ACDelco / GM",
   "ar": "جي إم أصلي",
   "models": [
    "dexos1"
   ]
  },
  {
   "id": "petromin",
   "en": "Petromin",
   "ar": "بترومين",
   "models": []
  },
  {
   "id": "original",
   "en": "Original (OEM)",
   "ar": "أصلي من الوكالة",
   "models": []
  }
 ]
};

/** خيارات سريعة: لزوجة الزيت وسعة البطارية */
export const PART_SPECS: Partial<Record<PartKind, string[]>> = {"oil": ["0W-20", "0W-30", "5W-20", "5W-30", "5W-40", "10W-40", "15W-40", "20W-50"], "battery": ["45 Ah", "55 Ah", "60 Ah", "70 Ah", "75 Ah", "80 Ah", "90 Ah", "100 Ah", "110 Ah"]};

export const PART_LABELS: Record<PartKind, { brand: string; model: string; spec: string }> = {
  tires: { brand: 'ماركة الإطار', model: 'الموديل', spec: 'المقاس' },
  battery: { brand: 'ماركة البطارية', model: 'النوع', spec: 'السعة' },
  oil: { brand: 'ماركة الزيت', model: 'النوع', spec: 'اللزوجة' },
};
