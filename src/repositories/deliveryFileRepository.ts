import { queryOne } from '../config/database';
import type { DeliveryFile, UpsertDeliveryFileDTO } from '../types/deliveryFile.types';

export const deliveryFileRepository = {
  async findByDeliveryId(deliveryId: number): Promise<DeliveryFile | null> {
    return queryOne<DeliveryFile>(
      'SELECT * FROM delivery_files WHERE delivery_id = $1',
      [deliveryId]
    );
  },

  async upsert(data: UpsertDeliveryFileDTO): Promise<DeliveryFile> {
    const result = await queryOne<DeliveryFile>(
      `INSERT INTO delivery_files (delivery_id, file_name, mime_type, size_bytes, content)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (delivery_id) DO UPDATE SET
         file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type,
         size_bytes = EXCLUDED.size_bytes,
         content = EXCLUDED.content,
         updated_at = NOW()
       RETURNING *`,
      [data.delivery_id, data.file_name, data.mime_type, data.size_bytes, data.content]
    );
    return result!;
  }
};
