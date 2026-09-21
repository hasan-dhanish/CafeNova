import { CustomizationOptionDto, ProductDto } from './menu';

export interface CartItem {
  cartItemId: string; // generated unique id for cart item (product + customization combo)
  product: ProductDto;
  quantity: number;
  selectedOptions: CustomizationOptionDto[];
  unitPrice: number; // base price + options
  totalPrice: number; // unitPrice * quantity
}

export interface CreateOrderPayload {
  tableId: string;
  customerNotes?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
    optionIds: string[];
  }[];
}

export interface OrderDetailDto {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  customerNotes: string | null;
  createdAt: string;
  tableNumber: string;
  estimatedTimeMin: number;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    customizations: {
      groupName: string;
      optionName: string;
      priceModifier: number;
    }[];
  }[];
}
