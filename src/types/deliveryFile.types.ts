import type { UserType } from './user.types';

export interface DeliveryFile {
  id: number;
  delivery_id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  content: Buffer;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertDeliveryFileDTO {
  delivery_id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  content: Buffer;
}

export interface SubmitDeliveryFileParams {
  deliveryId: number;
  userId: number;
  userType: UserType;
  file?: Express.Multer.File;
}

export interface GetDeliveryFileParams {
  deliveryId: number;
  userId: number;
  userType: UserType;
}
