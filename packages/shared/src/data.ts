// data.ts — TODOS los valores que podés editar (precios, escalones, tarifas de envío, provincias, medidas).
// Generado a partir de pricing.js / shipping.js (versión 2026.10.16-b de la tienda actual).
// Dinero en pesos enteros (ARS). Para cambiar un precio: editá acá y corré `npm test`.

export type Zone = 1 | 2 | 3;
export type PrintMode = 'front' | 'both';

export const MIN_CM = 2;
export const MAX_CM = 15;
/** Sticker suelto: precio fijo por unidad (2 a 15 cm). */
export const SINGLE_PRICE = 800;

/** Plancha de stickers armada por el cliente. */
export const SHEET = {
  "widthCm": 58,
  "lengthCm": 50,
  "price": 18000,
  "gapCm": 0.5,
  "maxStickerCm": 30
} as const;

export interface SizeGuideItem { id: string; label: string; min: number; ideal: number; max: number; tip: string }
export const SIZE_GUIDE: SizeGuideItem[] = [
  {
    "id": "termo",
    "label": "Termo / botella",
    "min": 4,
    "ideal": 5,
    "max": 7,
    "tip": "Varios chicos de 4 a 6 cm se ven mejor que uno grande. Dejá 1 grande de 7 cm como estrella."
  },
  {
    "id": "funda",
    "label": "Funda de celular",
    "min": 3,
    "ideal": 4,
    "max": 6,
    "tip": "La parte de atrás mide unos 7 × 15 cm: de 3 a 5 cm entran 2 o 3 sin tapar la cámara."
  },
  {
    "id": "notebook",
    "label": "Notebook",
    "min": 5,
    "ideal": 8,
    "max": 12,
    "tip": "La tapa de una notebook de 14\" mide unos 32 × 22 cm: combiná 1 de 10 cm con varios de 5 a 7 cm."
  },
  {
    "id": "cuaderno",
    "label": "Cuaderno / carpeta",
    "min": 5,
    "ideal": 7,
    "max": 10,
    "tip": "Tapas de 21 × 30 cm: de 6 a 8 cm queda equilibrado."
  },
  {
    "id": "mate",
    "label": "Mate / vaso",
    "min": 3,
    "ideal": 4,
    "max": 6,
    "tip": "Superficie curva y chica: elegí stickers de 3 a 5 cm."
  },
  {
    "id": "casco",
    "label": "Casco / bici / auto",
    "min": 8,
    "ideal": 10,
    "max": 15,
    "tip": "Se ven de lejos: de 8 a 12 cm. El vinilo UV aguanta sol y agua."
  }
];

export interface Tier { min: number; label: string; name: string }
/** Escalones de precio de prendas: se define con el total de prendas estampadas del pedido. */
export const TIERS: Tier[] = [
  {
    "min": 1,
    "label": "1 a 10 u.",
    "name": "Minorista"
  },
  {
    "min": 11,
    "label": "11 a 14 u.",
    "name": "Intermedio"
  },
  {
    "min": 15,
    "label": "15 o más",
    "name": "Mayorista"
  }
];

export const PRINT_LABELS: Record<PrintMode, string> = {
  "front": "Estampa adelante",
  "both": "Doble estampa (adelante y atrás)"
};

export interface Size { id: string; label: string; chestCm: number; lengthCm: number }
export interface Garment {
  id: string; label: string; geometry: 'tee' | 'crop' | 'tank' | 'hoodie'; material: string;
  /** [minorista, intermedio, mayorista] */
  prices: { front: number[]; both: number[] };
  sizes: Size[];
}
// La remera niño es 20% más barata que la clásica (redondeo a $50): los valores ya están calculados.
export const GARMENTS: Garment[] = [
  {
    "id": "remera_basica",
    "label": "Remera clásica",
    "geometry": "tee",
    "material": "Algodón 24/1 · buena calidad",
    "prices": {
      "front": [
        17000,
        14000,
        13000
      ],
      "both": [
        20000,
        17000,
        15000
      ]
    },
    "sizes": [
      {
        "id": "XS",
        "label": "XS",
        "chestCm": 42,
        "lengthCm": 62
      },
      {
        "id": "S",
        "label": "S",
        "chestCm": 47,
        "lengthCm": 66
      },
      {
        "id": "M",
        "label": "M",
        "chestCm": 49,
        "lengthCm": 68
      },
      {
        "id": "L",
        "label": "L",
        "chestCm": 51,
        "lengthCm": 70
      },
      {
        "id": "XL",
        "label": "XL",
        "chestCm": 53,
        "lengthCm": 72
      },
      {
        "id": "XXL",
        "label": "XXL",
        "chestCm": 55,
        "lengthCm": 74
      }
    ]
  },
  {
    "id": "remera_especial",
    "label": "Remera talle especial",
    "geometry": "tee",
    "material": "Algodón 24/1 · buena calidad",
    "prices": {
      "front": [
        19000,
        16000,
        14000
      ],
      "both": [
        22000,
        19000,
        16000
      ]
    },
    "sizes": [
      {
        "id": "6",
        "label": "6",
        "chestCm": 59,
        "lengthCm": 78
      },
      {
        "id": "7",
        "label": "7",
        "chestCm": 61,
        "lengthCm": 80
      },
      {
        "id": "8",
        "label": "8",
        "chestCm": 63,
        "lengthCm": 82
      },
      {
        "id": "9",
        "label": "9",
        "chestCm": 65,
        "lengthCm": 84
      },
      {
        "id": "10",
        "label": "10",
        "chestCm": 67,
        "lengthCm": 86
      }
    ]
  },
  {
    "id": "remera_nino",
    "label": "Remera niño",
    "geometry": "tee",
    "material": "Algodón 24/1 · buena calidad",
    "prices": {
      "front": [
        13600,
        11200,
        10400
      ],
      "both": [
        16600,
        14200,
        13400
      ]
    },
    "sizes": [
      {
        "id": "6",
        "label": "6",
        "chestCm": 32,
        "lengthCm": 46
      },
      {
        "id": "8",
        "label": "8",
        "chestCm": 34,
        "lengthCm": 48
      },
      {
        "id": "10",
        "label": "10",
        "chestCm": 36,
        "lengthCm": 50
      },
      {
        "id": "12",
        "label": "12",
        "chestCm": 38,
        "lengthCm": 52
      },
      {
        "id": "14",
        "label": "14",
        "chestCm": 40,
        "lengthCm": 54
      },
      {
        "id": "16",
        "label": "16",
        "chestCm": 42,
        "lengthCm": 56
      }
    ]
  },
  {
    "id": "crop_top",
    "label": "Crop top",
    "geometry": "crop",
    "material": "Algodón 24/1 · buena calidad",
    "prices": {
      "front": [
        13000,
        11000,
        9000
      ],
      "both": [
        16000,
        14000,
        12000
      ]
    },
    "sizes": [
      {
        "id": "S",
        "label": "S",
        "chestCm": 40,
        "lengthCm": 40
      },
      {
        "id": "M",
        "label": "M",
        "chestCm": 42,
        "lengthCm": 42
      },
      {
        "id": "L",
        "label": "L",
        "chestCm": 44,
        "lengthCm": 44
      },
      {
        "id": "XL",
        "label": "XL",
        "chestCm": 46,
        "lengthCm": 46
      }
    ]
  },
  {
    "id": "musculosa",
    "label": "Musculosa",
    "geometry": "tank",
    "material": "Algodón 24/1 · buena calidad",
    "prices": {
      "front": [
        15000,
        12500,
        10000
      ],
      "both": [
        18000,
        15500,
        13000
      ]
    },
    "sizes": [
      {
        "id": "S",
        "label": "S",
        "chestCm": 48,
        "lengthCm": 66
      },
      {
        "id": "M",
        "label": "M",
        "chestCm": 50,
        "lengthCm": 68
      },
      {
        "id": "L",
        "label": "L",
        "chestCm": 52,
        "lengthCm": 70
      },
      {
        "id": "XL",
        "label": "XL",
        "chestCm": 54,
        "lengthCm": 72
      },
      {
        "id": "XXL",
        "label": "XXL",
        "chestCm": 56,
        "lengthCm": 74
      }
    ]
  },
  {
    "id": "buzo_canguro",
    "label": "Buzo canguro frisa",
    "geometry": "hoodie",
    "material": "Friza · con capucha y bolsillo",
    "prices": {
      "front": [
        38000,
        33000,
        30000
      ],
      "both": [
        44000,
        39000,
        36000
      ]
    },
    "sizes": [
      {
        "id": "S",
        "label": "S",
        "chestCm": 50,
        "lengthCm": 62
      },
      {
        "id": "M",
        "label": "M",
        "chestCm": 52,
        "lengthCm": 64
      },
      {
        "id": "L",
        "label": "L",
        "chestCm": 54,
        "lengthCm": 66
      },
      {
        "id": "XL",
        "label": "XL",
        "chestCm": 56,
        "lengthCm": 68
      },
      {
        "id": "XXL",
        "label": "XXL",
        "chestCm": 58,
        "lengthCm": 70
      }
    ]
  }
];

export interface ShirtColor { id: string; label: string; hex: string }
export const SHIRT_COLORS: ShirtColor[] = [
  {
    "id": "blanco",
    "label": "Blanco",
    "hex": "#F4F2EC"
  },
  {
    "id": "negro",
    "label": "Negro",
    "hex": "#161616"
  },
  {
    "id": "gris",
    "label": "Gris",
    "hex": "#A6A6A0"
  },
  {
    "id": "marino",
    "label": "Azul marino",
    "hex": "#1F2A44"
  },
  {
    "id": "bordo",
    "label": "Bordó",
    "hex": "#5C1F2A"
  },
  {
    "id": "verde",
    "label": "Verde militar",
    "hex": "#4B5320"
  },
  {
    "id": "arena",
    "label": "Arena",
    "hex": "#D8C8A8"
  }
];

// ---------------- Envíos (Correo Argentino, tarifa estimada "Clásico") ----------------
export interface Province { id: string; label: string; zone: Zone }
export const PROVINCES: Province[] = [
  {
    "id": "caba",
    "label": "Ciudad Autónoma de Buenos Aires",
    "zone": 1
  },
  {
    "id": "buenos_aires",
    "label": "Buenos Aires",
    "zone": 1
  },
  {
    "id": "catamarca",
    "label": "Catamarca",
    "zone": 2
  },
  {
    "id": "chaco",
    "label": "Chaco",
    "zone": 2
  },
  {
    "id": "chubut",
    "label": "Chubut",
    "zone": 3
  },
  {
    "id": "cordoba",
    "label": "Córdoba",
    "zone": 1
  },
  {
    "id": "corrientes",
    "label": "Corrientes",
    "zone": 2
  },
  {
    "id": "entre_rios",
    "label": "Entre Ríos",
    "zone": 1
  },
  {
    "id": "formosa",
    "label": "Formosa",
    "zone": 3
  },
  {
    "id": "jujuy",
    "label": "Jujuy",
    "zone": 3
  },
  {
    "id": "la_pampa",
    "label": "La Pampa",
    "zone": 1
  },
  {
    "id": "la_rioja",
    "label": "La Rioja",
    "zone": 2
  },
  {
    "id": "mendoza",
    "label": "Mendoza",
    "zone": 2
  },
  {
    "id": "misiones",
    "label": "Misiones",
    "zone": 3
  },
  {
    "id": "neuquen",
    "label": "Neuquén",
    "zone": 2
  },
  {
    "id": "rio_negro",
    "label": "Río Negro",
    "zone": 2
  },
  {
    "id": "salta",
    "label": "Salta",
    "zone": 3
  },
  {
    "id": "san_juan",
    "label": "San Juan",
    "zone": 2
  },
  {
    "id": "san_luis",
    "label": "San Luis",
    "zone": 2
  },
  {
    "id": "santa_cruz",
    "label": "Santa Cruz",
    "zone": 3
  },
  {
    "id": "santa_fe",
    "label": "Santa Fe",
    "zone": 1
  },
  {
    "id": "santiago_del_estero",
    "label": "Santiago del Estero",
    "zone": 2
  },
  {
    "id": "tierra_del_fuego",
    "label": "Tierra del Fuego",
    "zone": 3
  },
  {
    "id": "tucuman",
    "label": "Tucumán",
    "zone": 2
  }
] as Province[];

/** Tarifa a domicilio por zona: [kg, precio ARS] */
export const TARIFAS: Record<Zone, [number, number][]> = {
  "1": [
    [
      1,
      9648
    ],
    [
      5,
      15957
    ],
    [
      10,
      21342
    ]
  ],
  "2": [
    [
      1,
      10509
    ],
    [
      5,
      17880
    ],
    [
      10,
      25423
    ]
  ],
  "3": [
    [
      1,
      10586
    ],
    [
      5,
      19724
    ],
    [
      10,
      30568
    ]
  ]
} as any;
/** A sucursal sale más barato: proporción respecto del domicilio. */
export const RATIO_SUCURSAL: Record<Zone, number> = {
  "1": 0.7,
  "2": 0.71,
  "3": 0.73
} as any;

export const PESO_PRENDA: Record<string, number> = {
  "remera_basica": 0.3,
  "remera_especial": 0.38,
  "remera_nino": 0.22,
  "crop_top": 0.22,
  "musculosa": 0.24,
  "buzo_canguro": 0.85
};
export const PESO_PLANCHA = 0.2;       // plancha de vinilo enrollada
export const PESO_STICKER_SUELTO = 0.02;
export const PESO_EMBALAJE = 0.3;      // bolsa / caja

export type DeliveryMethod = 'retiro' | 'correo_domicilio' | 'correo_sucursal';
export const METHODS: Record<DeliveryMethod, string> = {
  "retiro": "Retiro en local",
  "correo_domicilio": "Correo Argentino a domicilio",
  "correo_sucursal": "Correo Argentino a sucursal"
} as any;
