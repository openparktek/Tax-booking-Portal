// Comprehensive database of car brands and models commonly used for limousine services
export interface CarBrand {
  id: string;
  name: string;
  models: string[];
}

export const carDatabase: CarBrand[] = [
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    models: [
      "S-Class",
      "E-Class",
      "GLS",
      "GLE",
      "V-Class",
      "Sprinter",
      "Maybach S-Class",
    ],
  },
  {
    id: "bmw",
    name: "BMW",
    models: [
      "7 Series",
      "5 Series",
      "X7",
      "X5",
      "i7",
    ],
  },
  {
    id: "audi",
    name: "Audi",
    models: [
      "A8",
      "A6",
      "Q7",
      "Q8",
      "e-tron",
    ],
  },
  {
    id: "lexus",
    name: "Lexus",
    models: [
      "LS",
      "ES",
      "LX",
      "RX",
      "GX",
    ],
  },
  {
    id: "cadillac",
    name: "Cadillac",
    models: [
      "Escalade",
      "CT6",
      "XT6",
      "XT5",
    ],
  },
  {
    id: "lincoln",
    name: "Lincoln",
    models: [
      "Navigator",
      "Continental",
      "Aviator",
      "Nautilus",
    ],
  },
  {
    id: "toyota",
    name: "Toyota",
    models: [
      "Land Cruiser",
      "Sequoia",
      "Highlander",
      "Sienna",
      "Alphard",
    ],
  },
  {
    id: "chrysler",
    name: "Chrysler",
    models: [
      "300",
      "Pacifica",
    ],
  },
  {
    id: "chevrolet",
    name: "Chevrolet",
    models: [
      "Suburban",
      "Tahoe",
      "Traverse",
    ],
  },
  {
    id: "gmc",
    name: "GMC",
    models: [
      "Yukon",
      "Yukon XL",
      "Denali",
    ],
  },
  {
    id: "ford",
    name: "Ford",
    models: [
      "Expedition",
      "Explorer",
      "Transit",
    ],
  },
  {
    id: "range-rover",
    name: "Range Rover",
    models: [
      "Range Rover",
      "Range Rover Sport",
      "Range Rover Velar",
      "Range Rover Evoque",
    ],
  },
  {
    id: "bentley",
    name: "Bentley",
    models: [
      "Flying Spur",
      "Bentayga",
      "Mulsanne",
    ],
  },
  {
    id: "rolls-royce",
    name: "Rolls-Royce",
    models: [
      "Phantom",
      "Ghost",
      "Cullinan",
      "Wraith",
    ],
  },
  {
    id: "porsche",
    name: "Porsche",
    models: [
      "Panamera",
      "Cayenne",
    ],
  },
  {
    id: "jaguar",
    name: "Jaguar",
    models: [
      "XJ",
      "XF",
      "F-Pace",
    ],
  },
  {
    id: "volvo",
    name: "Volvo",
    models: [
      "S90",
      "XC90",
      "XC60",
    ],
  },
  {
    id: "genesis",
    name: "Genesis",
    models: [
      "G90",
      "G80",
      "GV80",
    ],
  },
  {
    id: "infiniti",
    name: "Infiniti",
    models: [
      "QX80",
      "QX60",
      "Q70",
    ],
  },
  {
    id: "acura",
    name: "Acura",
    models: [
      "MDX",
      "RLX",
      "TLX",
    ],
  },
  {
    id: "maserati",
    name: "Maserati",
    models: [
      "Quattroporte",
      "Ghibli",
      "Levante",
    ],
  },
  {
    id: "tesla",
    name: "Tesla",
    models: [
      "Model S",
      "Model X",
      "Model 3",
    ],
  },
];

// Helper function to get models for a specific brand
export const getModelsForBrand = (brandId: string): string[] => {
  const brand = carDatabase.find(b => b.id === brandId);
  return brand ? brand.models : [];
};

// Helper function to get brand name by ID
export const getBrandName = (brandId: string): string => {
  const brand = carDatabase.find(b => b.id === brandId);
  return brand ? brand.name : "";
};
