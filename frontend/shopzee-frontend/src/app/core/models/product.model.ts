export interface Product {
  id: number;
  name: string;
  category: 'women' | 'men';
  subCategory?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  rating: number;
  reviews: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isInStock?: boolean;  // Optional: false = Out of Stock, undefined/true = In Stock
  tags?: string[];
  sku?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: Customer;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  joinedAt: Date;
  avatar?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}
