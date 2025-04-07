import { Types } from 'mongoose';

export interface IProduct {
  user: Types.ObjectId;
  seller: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  brand?: Types.ObjectId;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string; // ✅ Add this line
}
