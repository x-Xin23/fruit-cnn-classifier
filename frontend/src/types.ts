export interface FruitInfo {
  name: string;
  scientificName: string;
  calories: string;
  caloriePercentage: number;
  highlights: string;
  nutritionalProfile: {
    label: string;
    value: string;
    percentage: number;
  }[];
  superpowers: string[];
  trivia: string;
  origin: string;
}
