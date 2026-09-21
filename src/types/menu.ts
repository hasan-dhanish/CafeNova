export interface CustomizationOptionDto {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface CustomizationGroupDto {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: CustomizationOptionDto[];
}

export interface ProductDto {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  arModelUrl: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTimeMin: number;
  customizationGroups: CustomizationGroupDto[];
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  products: ProductDto[];
}

export interface TableInfoDto {
  id: string;
  tableNumber: string;
  capacity: number;
  status: string;
}

export interface MenuDataResponse {
  cafe: {
    id: string;
    name: string;
    address: string;
    currency: string;
    taxRate: number;
  };
  table: TableInfoDto | null;
  categories: CategoryDto[];
}
