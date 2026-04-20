export const TUNISIA_CITIES = [
  "Ariana",
  "B?ja",
  "Ben Arous",
  "Bizerte",
  "Gab?s",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "K?bili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "M?denine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan"
] as const;

export const TUNISIA_CITY_OPTIONS = TUNISIA_CITIES.map((city) => ({
  key: city,
  label: city,
}));
