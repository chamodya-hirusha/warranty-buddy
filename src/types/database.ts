import { RowDataPacket } from "mysql2";

export interface WarrantyRow extends RowDataPacket {
  id: string;
  productName: string;
  customerName: string;
  purchaseDate: Date;
  expiryDate: Date;
  createdAt: Date;
}
