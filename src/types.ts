export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  oldPrice?: number;
  badge?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  name: string;
  isLoggedIn: boolean;
}