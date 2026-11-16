// ماركات وموديلات السيارات الشائعة في الكويت — المستخدم يقدر يكتب غيرها يدوياً
// لإضافة ماركة أو موديل: أضفه هنا مباشرة
export type CarBrand = { id: string; en: string; ar: string; popular: boolean; models: string[] };

export const CAR_BRANDS: CarBrand[] = [
 {
  "id": "toyota",
  "en": "Toyota",
  "ar": "تويوتا",
  "popular": true,
  "models": [
   "Land Cruiser",
   "Land Cruiser Prado",
   "Land Cruiser 70",
   "Sequoia",
   "Tundra",
   "Tacoma",
   "Hilux",
   "Fortuner",
   "4Runner",
   "FJ Cruiser",
   "RAV4",
   "Highlander",
   "Grand Highlander",
   "Corolla Cross",
   "C-HR",
   "Camry",
   "Corolla",
   "Yaris",
   "Avalon",
   "Crown",
   "Supra",
   "GR86",
   "86",
   "Prius",
   "Raize",
   "Rush",
   "Innova",
   "Veloz",
   "Belta",
   "Urban Cruiser",
   "bZ4X",
   "Hiace",
   "Granvia",
   "Coaster"
  ]
 },
 {
  "id": "lexus",
  "en": "Lexus",
  "ar": "لكزس",
  "popular": true,
  "models": [
   "LX",
   "GX",
   "TX",
   "RX",
   "NX",
   "UX",
   "RZ",
   "LM",
   "ES",
   "IS",
   "LS",
   "GS",
   "RC",
   "LC",
   "CT"
  ]
 },
 {
  "id": "nissan",
  "en": "Nissan",
  "ar": "نيسان",
  "popular": true,
  "models": [
   "Patrol",
   "Patrol Super Safari",
   "Armada",
   "Pathfinder",
   "X-Trail",
   "Rogue",
   "Murano",
   "Qashqai",
   "Kicks",
   "Juke",
   "Terra",
   "Navara",
   "Frontier",
   "Titan",
   "Altima",
   "Maxima",
   "Sentra",
   "Sunny",
   "Micra",
   "Versa",
   "Z",
   "GT-R",
   "Leaf",
   "Urvan"
  ]
 },
 {
  "id": "chevrolet",
  "en": "Chevrolet",
  "ar": "شيفروليه",
  "popular": true,
  "models": [
   "Tahoe",
   "Suburban",
   "Silverado",
   "Colorado",
   "Traverse",
   "Blazer",
   "Equinox",
   "Trailblazer",
   "Captiva",
   "Groove",
   "Trax",
   "Malibu",
   "Camaro",
   "Corvette",
   "Cruze",
   "Impala",
   "Spark",
   "Spin",
   "Express"
  ]
 },
 {
  "id": "gmc",
  "en": "GMC",
  "ar": "جي إم سي",
  "popular": true,
  "models": [
   "Yukon",
   "Yukon XL",
   "Sierra",
   "Canyon",
   "Acadia",
   "Terrain",
   "Savana",
   "Hummer EV"
  ]
 },
 {
  "id": "hyundai",
  "en": "Hyundai",
  "ar": "هيونداي",
  "popular": true,
  "models": [
   "Palisade",
   "Santa Fe",
   "Tucson",
   "Creta",
   "Kona",
   "Venue",
   "Elantra",
   "Sonata",
   "Accent",
   "Azera",
   "Grandeur",
   "i10",
   "i20",
   "i30",
   "Veloster",
   "Staria",
   "H-1",
   "Santa Cruz",
   "Ioniq 5",
   "Ioniq 6"
  ]
 },
 {
  "id": "kia",
  "en": "Kia",
  "ar": "كيا",
  "popular": true,
  "models": [
   "Telluride",
   "Mohave",
   "Sorento",
   "Sportage",
   "Seltos",
   "Sonet",
   "Niro",
   "Carnival",
   "K8",
   "K5",
   "K3",
   "Cerato",
   "Pegas",
   "Rio",
   "Picanto",
   "Soul",
   "Stinger",
   "EV6",
   "EV9"
  ]
 },
 {
  "id": "mercedes",
  "en": "Mercedes-Benz",
  "ar": "مرسيدس-بنز",
  "popular": true,
  "models": [
   "G-Class",
   "GLS",
   "GLE",
   "GLE Coupe",
   "GLC",
   "GLC Coupe",
   "GLB",
   "GLA",
   "S-Class",
   "E-Class",
   "C-Class",
   "A-Class",
   "CLE",
   "CLS",
   "CLA",
   "SL",
   "AMG GT",
   "Maybach S-Class",
   "Maybach GLS",
   "EQS",
   "EQE",
   "EQB",
   "EQA",
   "V-Class",
   "Sprinter"
  ]
 },
 {
  "id": "bmw",
  "en": "BMW",
  "ar": "بي إم دبليو",
  "popular": true,
  "models": [
   "X7",
   "X6",
   "X5",
   "X4",
   "X3",
   "X2",
   "X1",
   "XM",
   "7 Series",
   "8 Series",
   "5 Series",
   "4 Series",
   "3 Series",
   "2 Series",
   "1 Series",
   "Z4",
   "M2",
   "M3",
   "M4",
   "M5",
   "M8",
   "iX",
   "iX3",
   "i7",
   "i5",
   "i4"
  ]
 },
 {
  "id": "landrover",
  "en": "Land Rover",
  "ar": "لاند روفر",
  "popular": true,
  "models": [
   "Range Rover",
   "Range Rover Sport",
   "Range Rover Velar",
   "Range Rover Evoque",
   "Defender",
   "Discovery",
   "Discovery Sport"
  ]
 },
 {
  "id": "ford",
  "en": "Ford",
  "ar": "فورد",
  "popular": true,
  "models": [
   "Expedition",
   "Explorer",
   "Edge",
   "Escape",
   "Territory",
   "Everest",
   "Bronco",
   "Bronco Sport",
   "F-150",
   "F-150 Raptor",
   "Ranger",
   "Mustang",
   "Mustang Mach-E",
   "Taurus",
   "Fusion",
   "Focus",
   "Figo",
   "Transit"
  ]
 },
 {
  "id": "mitsubishi",
  "en": "Mitsubishi",
  "ar": "ميتسوبيشي",
  "popular": true,
  "models": [
   "Pajero",
   "Pajero Sport",
   "Montero",
   "Outlander",
   "Eclipse Cross",
   "ASX",
   "Xpander",
   "L200",
   "Attrage",
   "Mirage",
   "Lancer"
  ]
 },
 {
  "id": "honda",
  "en": "Honda",
  "ar": "هوندا",
  "popular": true,
  "models": [
   "Pilot",
   "Passport",
   "CR-V",
   "HR-V",
   "ZR-V",
   "Odyssey",
   "Accord",
   "Civic",
   "City",
   "Jazz",
   "Ridgeline"
  ]
 },
 {
  "id": "infiniti",
  "en": "Infiniti",
  "ar": "إنفينيتي",
  "popular": false,
  "models": [
   "QX80",
   "QX60",
   "QX55",
   "QX50",
   "QX70",
   "QX56",
   "Q50",
   "Q60",
   "Q70"
  ]
 },
 {
  "id": "acura",
  "en": "Acura",
  "ar": "أكيورا",
  "popular": false,
  "models": [
   "MDX",
   "RDX",
   "TLX",
   "ILX",
   "Integra",
   "NSX"
  ]
 },
 {
  "id": "mazda",
  "en": "Mazda",
  "ar": "مازدا",
  "popular": false,
  "models": [
   "CX-90",
   "CX-9",
   "CX-60",
   "CX-50",
   "CX-5",
   "CX-30",
   "CX-3",
   "Mazda6",
   "Mazda3",
   "Mazda2",
   "MX-5",
   "BT-50"
  ]
 },
 {
  "id": "subaru",
  "en": "Subaru",
  "ar": "سوبارو",
  "popular": false,
  "models": [
   "Ascent",
   "Outback",
   "Forester",
   "XV",
   "Crosstrek",
   "Impreza",
   "Legacy",
   "WRX",
   "BRZ",
   "Solterra"
  ]
 },
 {
  "id": "suzuki",
  "en": "Suzuki",
  "ar": "سوزوكي",
  "popular": false,
  "models": [
   "Jimny",
   "Grand Vitara",
   "Vitara",
   "Fronx",
   "Swift",
   "Dzire",
   "Ciaz",
   "Baleno",
   "Ertiga",
   "XL7",
   "Celerio",
   "S-Presso",
   "APV",
   "Carry"
  ]
 },
 {
  "id": "isuzu",
  "en": "Isuzu",
  "ar": "إيسوزو",
  "popular": false,
  "models": [
   "D-Max",
   "MU-X",
   "N-Series",
   "F-Series"
  ]
 },
 {
  "id": "daihatsu",
  "en": "Daihatsu",
  "ar": "دايهاتسو",
  "popular": false,
  "models": [
   "Terios",
   "Sirion",
   "Gran Max"
  ]
 },
 {
  "id": "genesis",
  "en": "Genesis",
  "ar": "جينيسيس",
  "popular": false,
  "models": [
   "GV80",
   "GV80 Coupe",
   "GV70",
   "GV60",
   "G90",
   "G80",
   "G70"
  ]
 },
 {
  "id": "cadillac",
  "en": "Cadillac",
  "ar": "كاديلاك",
  "popular": false,
  "models": [
   "Escalade",
   "Escalade ESV",
   "XT6",
   "XT5",
   "XT4",
   "CT6",
   "CT5",
   "CT4",
   "Lyriq"
  ]
 },
 {
  "id": "lincoln",
  "en": "Lincoln",
  "ar": "لينكولن",
  "popular": false,
  "models": [
   "Navigator",
   "Aviator",
   "Nautilus",
   "Corsair",
   "Continental",
   "MKZ"
  ]
 },
 {
  "id": "dodge",
  "en": "Dodge",
  "ar": "دودج",
  "popular": false,
  "models": [
   "Charger",
   "Challenger",
   "Durango",
   "Journey",
   "Hornet"
  ]
 },
 {
  "id": "jeep",
  "en": "Jeep",
  "ar": "جيب",
  "popular": false,
  "models": [
   "Grand Wagoneer",
   "Wagoneer",
   "Grand Cherokee",
   "Grand Cherokee L",
   "Cherokee",
   "Wrangler",
   "Gladiator",
   "Compass",
   "Renegade"
  ]
 },
 {
  "id": "chrysler",
  "en": "Chrysler",
  "ar": "كرايسلر",
  "popular": false,
  "models": [
   "300",
   "300C",
   "Pacifica"
  ]
 },
 {
  "id": "ram",
  "en": "Ram",
  "ar": "رام",
  "popular": false,
  "models": [
   "1500",
   "1500 TRX",
   "2500",
   "3500"
  ]
 },
 {
  "id": "hummer",
  "en": "Hummer",
  "ar": "همر",
  "popular": false,
  "models": [
   "H1",
   "H2",
   "H3"
  ]
 },
 {
  "id": "tesla",
  "en": "Tesla",
  "ar": "تسلا",
  "popular": false,
  "models": [
   "Model S",
   "Model 3",
   "Model X",
   "Model Y",
   "Cybertruck"
  ]
 },
 {
  "id": "lucid",
  "en": "Lucid",
  "ar": "لوسيد",
  "popular": false,
  "models": [
   "Air",
   "Gravity"
  ]
 },
 {
  "id": "audi",
  "en": "Audi",
  "ar": "أودي",
  "popular": false,
  "models": [
   "Q8",
   "Q7",
   "Q5",
   "Q3",
   "Q2",
   "A8",
   "A7",
   "A6",
   "A5",
   "A4",
   "A3",
   "e-tron",
   "Q8 e-tron",
   "e-tron GT",
   "RS Q8",
   "RS7",
   "RS6",
   "RS3",
   "R8",
   "TT"
  ]
 },
 {
  "id": "volkswagen",
  "en": "Volkswagen",
  "ar": "فولكس فاجن",
  "popular": false,
  "models": [
   "Teramont",
   "Touareg",
   "Tiguan",
   "T-Roc",
   "T-Cross",
   "Passat",
   "Arteon",
   "Jetta",
   "Golf",
   "Golf GTI",
   "Polo",
   "ID.4",
   "Amarok",
   "Transporter"
  ]
 },
 {
  "id": "porsche",
  "en": "Porsche",
  "ar": "بورشه",
  "popular": false,
  "models": [
   "Cayenne",
   "Cayenne Coupe",
   "Macan",
   "Panamera",
   "911",
   "Taycan",
   "718 Cayman",
   "718 Boxster"
  ]
 },
 {
  "id": "mini",
  "en": "MINI",
  "ar": "ميني",
  "popular": false,
  "models": [
   "Cooper",
   "Cooper Convertible",
   "Countryman",
   "Clubman",
   "Aceman"
  ]
 },
 {
  "id": "jaguar",
  "en": "Jaguar",
  "ar": "جاكوار",
  "popular": false,
  "models": [
   "F-Pace",
   "E-Pace",
   "I-Pace",
   "XF",
   "XE",
   "XJ",
   "F-Type"
  ]
 },
 {
  "id": "volvo",
  "en": "Volvo",
  "ar": "فولفو",
  "popular": false,
  "models": [
   "XC90",
   "XC60",
   "XC40",
   "EX90",
   "EX30",
   "S90",
   "S60"
  ]
 },
 {
  "id": "opel",
  "en": "Opel",
  "ar": "أوبل",
  "popular": false,
  "models": [
   "Grandland",
   "Crossland",
   "Mokka",
   "Astra",
   "Corsa",
   "Insignia"
  ]
 },
 {
  "id": "skoda",
  "en": "Skoda",
  "ar": "سكودا",
  "popular": false,
  "models": [
   "Kodiaq",
   "Karoq",
   "Kamiq",
   "Superb",
   "Octavia"
  ]
 },
 {
  "id": "peugeot",
  "en": "Peugeot",
  "ar": "بيجو",
  "popular": false,
  "models": [
   "5008",
   "3008",
   "2008",
   "508",
   "408",
   "308",
   "301",
   "208",
   "Landtrek",
   "Partner",
   "Expert"
  ]
 },
 {
  "id": "renault",
  "en": "Renault",
  "ar": "رينو",
  "popular": false,
  "models": [
   "Koleos",
   "Arkana",
   "Duster",
   "Captur",
   "Megane",
   "Talisman",
   "Symbol",
   "Logan",
   "Kwid"
  ]
 },
 {
  "id": "citroen",
  "en": "Citroën",
  "ar": "ستروين",
  "popular": false,
  "models": [
   "C5 Aircross",
   "C3 Aircross",
   "C4",
   "C3",
   "Berlingo"
  ]
 },
 {
  "id": "fiat",
  "en": "Fiat",
  "ar": "فيات",
  "popular": false,
  "models": [
   "500",
   "500X",
   "Tipo",
   "Doblo",
   "Ducato"
  ]
 },
 {
  "id": "alfaromeo",
  "en": "Alfa Romeo",
  "ar": "ألفا روميو",
  "popular": false,
  "models": [
   "Stelvio",
   "Giulia",
   "Tonale"
  ]
 },
 {
  "id": "maserati",
  "en": "Maserati",
  "ar": "مازيراتي",
  "popular": false,
  "models": [
   "Levante",
   "Grecale",
   "Ghibli",
   "Quattroporte",
   "GranTurismo",
   "MC20"
  ]
 },
 {
  "id": "ferrari",
  "en": "Ferrari",
  "ar": "فيراري",
  "popular": false,
  "models": [
   "Purosangue",
   "Roma",
   "Portofino",
   "296 GTB",
   "F8 Tributo",
   "SF90 Stradale",
   "812 Superfast",
   "12Cilindri"
  ]
 },
 {
  "id": "lamborghini",
  "en": "Lamborghini",
  "ar": "لامبورغيني",
  "popular": false,
  "models": [
   "Urus",
   "Huracán",
   "Revuelto",
   "Aventador"
  ]
 },
 {
  "id": "bentley",
  "en": "Bentley",
  "ar": "بنتلي",
  "popular": false,
  "models": [
   "Bentayga",
   "Continental GT",
   "Flying Spur"
  ]
 },
 {
  "id": "rollsroyce",
  "en": "Rolls-Royce",
  "ar": "رولز رويس",
  "popular": false,
  "models": [
   "Cullinan",
   "Ghost",
   "Phantom",
   "Spectre",
   "Wraith",
   "Dawn"
  ]
 },
 {
  "id": "astonmartin",
  "en": "Aston Martin",
  "ar": "أستون مارتن",
  "popular": false,
  "models": [
   "DBX",
   "DB12",
   "DB11",
   "Vantage",
   "DBS"
  ]
 },
 {
  "id": "mclaren",
  "en": "McLaren",
  "ar": "ماكلارين",
  "popular": false,
  "models": [
   "750S",
   "720S",
   "765LT",
   "Artura",
   "GT"
  ]
 },
 {
  "id": "mg",
  "en": "MG",
  "ar": "إم جي",
  "popular": false,
  "models": [
   "ZS",
   "HS",
   "RX5",
   "RX8",
   "One",
   "MG7",
   "MG6",
   "MG5",
   "GT",
   "MG4",
   "T60"
  ]
 },
 {
  "id": "geely",
  "en": "Geely",
  "ar": "جيلي",
  "popular": false,
  "models": [
   "Monjaro",
   "Starray",
   "Tugella",
   "Okavango",
   "Azkarra",
   "Coolray",
   "Emgrand",
   "Geometry C"
  ]
 },
 {
  "id": "chery",
  "en": "Chery",
  "ar": "شيري",
  "popular": false,
  "models": [
   "Tiggo 9",
   "Tiggo 8 Pro",
   "Tiggo 7 Pro",
   "Tiggo 4 Pro",
   "Tiggo 3",
   "Tiggo 2",
   "Arrizo 8",
   "Arrizo 6",
   "Arrizo 5"
  ]
 },
 {
  "id": "changan",
  "en": "Changan",
  "ar": "شانجان",
  "popular": false,
  "models": [
   "CS95",
   "CS85",
   "CS75 Plus",
   "CS55 Plus",
   "CS35 Plus",
   "UNI-K",
   "UNI-T",
   "UNI-V",
   "Hunter",
   "Eado",
   "Alsvin"
  ]
 },
 {
  "id": "haval",
  "en": "Haval",
  "ar": "هافال",
  "popular": false,
  "models": [
   "H9",
   "H6",
   "H6 GT",
   "Jolion",
   "Dargo"
  ]
 },
 {
  "id": "gwm",
  "en": "Great Wall",
  "ar": "جريت وول",
  "popular": false,
  "models": [
   "Poer",
   "Wingle 7",
   "Wingle 5"
  ]
 },
 {
  "id": "tank",
  "en": "Tank",
  "ar": "تانك",
  "popular": false,
  "models": [
   "700",
   "500",
   "300"
  ]
 },
 {
  "id": "jetour",
  "en": "Jetour",
  "ar": "جيتور",
  "popular": false,
  "models": [
   "T2",
   "T1",
   "X90 Plus",
   "X70 Plus",
   "X70",
   "Dashing"
  ]
 },
 {
  "id": "gac",
  "en": "GAC",
  "ar": "جي إيه سي",
  "popular": false,
  "models": [
   "GS8",
   "GS4",
   "GS3",
   "Emkoo",
   "Empow",
   "GN8",
   "GN6",
   "GA8",
   "GA6",
   "GA4"
  ]
 },
 {
  "id": "exeed",
  "en": "Exeed",
  "ar": "إكسيد",
  "popular": false,
  "models": [
   "VX",
   "RX",
   "TXL",
   "LX"
  ]
 },
 {
  "id": "omoda",
  "en": "Omoda",
  "ar": "أومودا",
  "popular": false,
  "models": [
   "C5",
   "E5"
  ]
 },
 {
  "id": "jaecoo",
  "en": "Jaecoo",
  "ar": "جايكو",
  "popular": false,
  "models": [
   "J8",
   "J7"
  ]
 },
 {
  "id": "jac",
  "en": "JAC",
  "ar": "جاك",
  "popular": false,
  "models": [
   "JS6",
   "JS4",
   "J7",
   "T9",
   "T8"
  ]
 },
 {
  "id": "byd",
  "en": "BYD",
  "ar": "بي واي دي",
  "popular": false,
  "models": [
   "Tang",
   "Han",
   "Seal",
   "Seal U",
   "Song Plus",
   "Atto 3",
   "Dolphin",
   "Qin Plus",
   "Shark"
  ]
 },
 {
  "id": "hongqi",
  "en": "Hongqi",
  "ar": "هونشي",
  "popular": false,
  "models": [
   "H9",
   "H5",
   "HS7",
   "HS5",
   "E-HS9"
  ]
 },
 {
  "id": "polestar",
  "en": "Polestar",
  "ar": "بولستار",
  "popular": false,
  "models": [
   "Polestar 4",
   "Polestar 3",
   "Polestar 2"
  ]
 },
 {
  "id": "lynkco",
  "en": "Lynk & Co",
  "ar": "لينك آند كو",
  "popular": false,
  "models": [
   "09",
   "05",
   "03",
   "01"
  ]
 }
];

/** يبحث بالعربي أو الإنجليزي */
export const matches = (q: string, ...fields: string[]) => {
  const n = q.trim().toLowerCase();
  return !n || fields.some((f) => f.toLowerCase().includes(n));
};

const THIS_YEAR = new Date().getFullYear();
export const CAR_YEARS = Array.from({ length: THIS_YEAR + 2 - 1990 }, (_, i) => String(THIS_YEAR + 1 - i));
