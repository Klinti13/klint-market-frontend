export interface User {
  _id?: string;
  name: string;
  email?: string;
  token?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  points?: number; 
  address?: string;
  city?: string;
  phone?: string;
}

export interface Product {
  id: any;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  badge?: string;
}

export interface CartItem extends Product {
  qty: number;
}