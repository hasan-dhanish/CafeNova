export interface ChaiFeature {
  iconType: 'leaf' | 'droplet' | 'sparkles' | 'flame';
  line1: string;
  line2: string;
}

export interface ChaiItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  ingredientImage: string;
  sketchImage: string;
  flavorTag: string;
  description: string;
  spices: string[];
  features: ChaiFeature[];
  offsetY?: number; // Shifts image vertically to align glass base on table
}

export const CHAI_ITEMS: ChaiItem[] = [
  {
    id: 'classic',
    name: 'Classic Chai',
    subtitle: 'Slow-Brewed Cutting Milk Chai',
    price: 45,
    image: '/chai/Classic Chai.png',
    ingredientImage: '/chai/ingredients/assam_tea.jpg',
    sketchImage: '/chai/Classic.png',
    flavorTag: 'Assam Gold Tea',
    description: 'Fresh whole milk simmered with premium Assam CTC tea leaves, aerated to creamy, frothy perfection.',
    spices: ['Assam Black Tea', 'Fresh Milk', 'Frothy Crema'],
    features: [
      { iconType: 'leaf', line1: 'Premium', line2: 'Tea Leaves' },
      { iconType: 'droplet', line1: 'Rich', line2: 'Milk Blend' },
      { iconType: 'sparkles', line1: 'Balanced', line2: 'Sweetness' },
    ],
    offsetY: 0,
  },
  {
    id: 'ginger',
    name: 'Ginger Chai',
    subtitle: 'Crushed Fresh Adrak Tea',
    price: 55,
    image: '/chai/Ginger Chai.png',
    ingredientImage: '/chai/ingredients/ginger_root.jpg',
    sketchImage: '/chai/Ginger.png',
    flavorTag: 'Fresh Crushed Adrak',
    description: 'Hand-pounded spicy ginger root steeped in piping hot milk tea — invigorating and soul-warming.',
    spices: ['Fresh Ginger Root', 'Strong Assam Brew', 'Pure Cane Sugar'],
    features: [
      { iconType: 'leaf', line1: 'Crushed', line2: 'Adrak Root' },
      { iconType: 'flame', line1: 'Zesty', line2: 'Warm Kick' },
      { iconType: 'droplet', line1: 'Slow', line2: 'Simmered' },
    ],
    offsetY: 2,
  },
  {
    id: 'masala',
    name: 'Masala Chai',
    subtitle: 'Authentic 7-Spice Blend',
    price: 60,
    image: '/chai/Masala Chai.png',
    ingredientImage: '/chai/ingredients/masala_spices.jpg',
    sketchImage: '/chai/Masala.png',
    flavorTag: 'Royal 7-Spices',
    description: 'A robust heritage concoction of cinnamon barks, star anise, black pepper, cloves, and cardamom.',
    spices: ['Ceylon Cinnamon', 'Star Anise', 'Cloves & Pepper'],
    features: [
      { iconType: 'sparkles', line1: 'Royal', line2: '7 Spices' },
      { iconType: 'flame', line1: 'Deep', line2: 'Warmth' },
      { iconType: 'droplet', line1: 'Full-Bodied', line2: 'Crema' },
    ],
    offsetY: 10,
  },
  {
    id: 'elachi',
    name: 'Elaichi Chai',
    subtitle: 'Green Cardamom Infused Milk Tea',
    price: 55,
    image: '/chai/Elachi Chai.png',
    ingredientImage: '/chai/ingredients/cardamom.jpg',
    sketchImage: '/chai/Elachi.png',
    flavorTag: 'Idukki Elaichi',
    description: 'Freshly crushed Idukki green cardamom pods simmered slowly to infuse a fragrant, soothing aroma.',
    spices: ['Idukki Cardamom', 'Assam CTC', 'Rich Milk'],
    features: [
      { iconType: 'leaf', line1: 'Idukki', line2: 'Cardamom' },
      { iconType: 'sparkles', line1: 'Fragrant', line2: 'Aroma' },
      { iconType: 'droplet', line1: 'Soothing', line2: 'Sip' },
    ],
    offsetY: 2,
  },
  {
    id: 'gulkund',
    name: 'Gulkund Chai',
    subtitle: 'Sun-Cured Damascus Rose Petal Tea',
    price: 65,
    image: '/chai/Gulkund Chai.png',
    ingredientImage: '/chai/ingredients/rose_petals.jpg',
    sketchImage: '/chai/Gulkund.png',
    flavorTag: 'Damascus Rose',
    description: 'Sweet sun-preserved rose petal preserve (Gulkund) blended with velvety milk tea for a delicate floral aroma.',
    spices: ['Sun-Dried Rose Petals', 'Gulkund Preserve', 'Creamy Milk'],
    features: [
      { iconType: 'sparkles', line1: 'Damascus', line2: 'Rose Petals' },
      { iconType: 'droplet', line1: 'Velvety', line2: 'Texture' },
      { iconType: 'leaf', line1: 'Floral', line2: 'Sweet Note' },
    ],
    offsetY: 2,
  },
];
