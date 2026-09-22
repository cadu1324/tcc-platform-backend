import type { UserType } from './user.types';
import type { DeliveryStatus } from './project.types';

export interface DeliveryFile {
  id: number;
  delivery_id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  content: Buffer;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeliveryFileVersionDTO {
  delivery_id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  content: Buffer;
}

export type DeliveryFileVersionSummary = Omit<DeliveryFile, 'content' | 'mime_type' | 'updated_at'>;

export interface DeliveryFileVersionStatus extends DeliveryFileVersionSummary {
  status: DeliveryStatus;
}

export interface GetDeliveryFileVersionsParams {
  deliveryId: number;
  userId: number;
  userType: UserType;
}

export interface GetDeliveryFileVersionParams {
  deliveryId: number;
  versionId: number;
  userId: number;
  userType: UserType;
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
