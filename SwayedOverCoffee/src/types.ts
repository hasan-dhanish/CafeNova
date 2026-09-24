export interface FlavorVariant {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  cupImage: string;
  ingredientIcon: string;
  ingredientName: string;
  accentColor: string;
  description: string;
  tag: string;
  notes: string[];
}

export interface CartItem {
  variant: FlavorVariant;
  quantity: number;
  sweetness: string;
  milk: string;
  iceLevel: string;
}

export type ViewMode = 'showcase' | 'grid';
