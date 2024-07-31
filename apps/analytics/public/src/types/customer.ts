import { Gender } from 'config';

export interface CustomerProps {
  modal: boolean;
}

export interface CustomerList {
  id?: number;
  avatar: number;
  firstName: string;
  lastName: string;
  fatherName: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  role: string;
  orders: number;
  progress: number;
  status: number;
  orderStatus: string;
  contact: string;
  country: string;
  location: string;
  about: string;
  skills: string[];
  time: string[];
  date: Date | string | number;
}
