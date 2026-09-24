export interface ChaiItem {
  id: string;
  name: string;
  shortName: string;
  monogram: string;
  subtitle: string;
  price: number;
  image: string;
  ingredientImage: string;
  sketchImage: string;
  popSpiceImage: string;
  flavorTag: string;
  description: string;
  spices: string[];
  offsetY?: number; // Shifts image vertically to align glass base on table
}

export const CHAI_ITEMS: ChaiItem[] = [
  {
    id: 'classic',
    name: 'Classic Chai',
    shortName: 'Classic',
    monogram: 'C',
    subtitle: 'Slow-Brewed Cutting Milk Chai',
    price: 45,
    image: '/chai/Classic Chai.png',
    ingredientImage: '/chai/ingredients/assam_tea.jpg',
    sketchImage: '/chai/Classic.png',
    popSpiceImage: '/chai/ingredients/assam_tea_pop.png',
    flavorTag: 'Assam Gold Tea',
    description: 'Fresh whole milk simmered with premium Assam CTC tea leaves, aerated to creamy, frothy perfection.',
    spices: ['Assam Black Tea', 'Fresh Milk', 'Frothy Crema'],
    offsetY: 0,
  },
  {
    id: 'elachi',
    name: 'Elaichi Chai',
    shortName: 'Elaichi',
    monogram: 'E',
    subtitle: 'Green Cardamom Infused Milk Tea',
    price: 55,
    image: '/chai/Elachi Chai.png',
    ingredientImage: '/chai/ingredients/cardamom.jpg',
    sketchImage: '/chai/Elachi.png',
    popSpiceImage: '/chai/ingredients/cardamom_pop.png',
    flavorTag: 'Idukki Elaichi',
    description: 'Freshly crushed Idukki green cardamom pods simmered slowly to infuse a fragrant, soothing aroma.',
    spices: ['Idukki Cardamom', 'Assam CTC', 'Rich Milk'],
    offsetY: 10,
  },
  {
    id: 'ginger',
    name: 'Ginger Chai',
    shortName: 'Ginger',
    monogram: 'G',
    subtitle: 'Crushed Fresh Adrak Tea',
    price: 55,
    image: '/chai/Ginger Chai.png',
    ingredientImage: '/chai/ingredients/ginger_root.jpg',
    sketchImage: '/chai/Ginger.png',
    popSpiceImage: '/chai/ingredients/ginger_root_pop.png',
    flavorTag: 'Fresh Crushed Adrak',
    description: 'Hand-pounded spicy ginger root steeped in piping hot milk tea — invigorating and soul-warming.',
    spices: ['Fresh Ginger Root', 'Strong Assam Brew', 'Pure Cane Sugar'],
    offsetY: 12,
  },
  {
    id: 'gulkund',
    name: 'Gulkund Chai',
    shortName: 'Gulkund',
    monogram: 'R',
    subtitle: 'Sun-Cured Damascus Rose Petal Tea',
    price: 65,
    image: '/chai/Gulkund Chai.png',
    ingredientImage: '/chai/ingredients/rose_petals.jpg',
    sketchImage: '/chai/Gulkund.png',
    popSpiceImage: '/chai/ingredients/rose_petals_pop.png',
    flavorTag: 'Damascus Rose',
    description: 'Sweet sun-preserved rose petal preserve (Gulkund) blended with velvety milk tea for a delicate floral aroma.',
    spices: ['Sun-Dried Rose Petals', 'Gulkund Preserve', 'Creamy Milk'],
    offsetY: 8,
  },
  {
    id: 'masala',
    name: 'Masala Chai',
    shortName: 'Masala',
    monogram: 'M',
    subtitle: 'Authentic 7-Spice Blend',
    price: 60,
    image: '/chai/Masala Chai.png',
    ingredientImage: '/chai/ingredients/masala_spices.jpg',
    sketchImage: '/chai/Masala.png',
    popSpiceImage: '/chai/ingredients/masala_spices_pop.png',
    flavorTag: 'Royal 7-Spices',
    description: 'A robust heritage concoction of cinnamon barks, star anise, black pepper, cloves, and cardamom.',
    spices: ['Ceylon Cinnamon', 'Star Anise', 'Cloves & Pepper'],
    offsetY: 52, // Offsets downward so glass base aligns with Classic Chai
  },
];

