import { query, queryOne, withTransaction } from '../config/database';
import type {
  DeliveryFile,
  CreateDeliveryFileVersionDTO,
  DeliveryFileVersionSummary
} from '../types/deliveryFile.types';

export const deliveryFileRepository = {
  // FOR UPDATE trava a linha da entrega antes do INSERT: sem isso, dois
  // uploads simultaneos (duplo clique, reenvio) leem o mesmo MAX(version)
  // em READ COMMITTED e um deles falha com 23505 na UNIQUE
  // (delivery_id, version). O lock precisa ser um statement a parte, antes
  // do INSERT — dentro do mesmo CTE o MAX ainda enxergaria o snapshot antigo.
  async create(data: CreateDeliveryFileVersionDTO): Promise<DeliveryFile> {
    return withTransaction(async (client) => {
      await client.query('SELECT id FROM deliveries WHERE id = $1 FOR UPDATE', [data.delivery_id]);

      const result = await client.query<DeliveryFile>(
        `INSERT INTO delivery_files (delivery_id, file_name, mime_type, size_bytes, content, version)
         VALUES (
           $1, $2, $3, $4, $5,
           (SELECT COALESCE(MAX(version), 0) + 1 FROM delivery_files WHERE delivery_id = $1)
         )
         RETURNING *`,
        [data.delivery_id, data.file_name, data.mime_type, data.size_bytes, data.content]
      );
      return result.rows[0];
    });
  },

  async findLatestByDeliveryId(deliveryId: number): Promise<DeliveryFile | null> {
    return queryOne<DeliveryFile>(
      `SELECT * FROM delivery_files WHERE delivery_id = $1
       ORDER BY version DESC LIMIT 1`,
      [deliveryId]
    );
  },

  async findVersionsByDeliveryId(deliveryId: number): Promise<DeliveryFileVersionSummary[]> {
    return query<DeliveryFileVersionSummary>(
      `SELECT id, delivery_id, file_name, size_bytes, version, created_at
       FROM delivery_files
       WHERE delivery_id = $1
       ORDER BY version DESC`,
      [deliveryId]
    );
  },

  async findVersionById(deliveryId: number, versionId: number): Promise<DeliveryFile | null> {
    return queryOne<DeliveryFile>(
      'SELECT * FROM delivery_files WHERE delivery_id = $1 AND id = $2',
      [deliveryId, versionId]
    );
  }
};
