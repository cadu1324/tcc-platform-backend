import { prisma } from '../config/prisma';
import type {
  DeliveryFile,
  CreateDeliveryFileVersionDTO,
  DeliveryFileVersionSummary
} from '../types/deliveryFile.types';

export const deliveryFileRepository = {
  // SELECT ... FOR UPDATE trava a linha da entrega antes do INSERT: sem
  // isso, dois uploads simultaneos (duplo clique, reenvio) leem o mesmo
  // MAX(version) em READ COMMITTED e um deles colidiria na UNIQUE
  // (delivery_id, version). O lock e um statement a parte, antes de ler
  // a ultima versao — dentro da mesma transacao interativa do Prisma,
  // a segunda chamada concorrente so le o findFirst depois que a primeira
  // ja commitou, entao enxerga a versao certa.
  async create(data: CreateDeliveryFileVersionDTO): Promise<DeliveryFile> {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${data.delivery_id} FOR UPDATE`;

      const latest = await tx.delivery_files.findFirst({
        where: { delivery_id: data.delivery_id },
        orderBy: { version: 'desc' },
        select: { version: true }
      });
      const nextVersion = (latest?.version ?? 0) + 1;

      const row = await tx.delivery_files.create({
        data: {
          delivery_id: data.delivery_id,
          file_name: data.file_name,
          mime_type: data.mime_type,
          size_bytes: data.size_bytes,
          content: data.content as Uint8Array<ArrayBuffer>,
          version: nextVersion
        }
      });
      return { ...row, content: Buffer.from(row.content) };
    });
  },

  async findLatestByDeliveryId(deliveryId: number): Promise<DeliveryFile | null> {
    const row = await prisma.delivery_files.findFirst({
      where: { delivery_id: deliveryId },
      orderBy: { version: 'desc' }
    });
    return row && { ...row, content: Buffer.from(row.content) };
  },

  async findVersionsByDeliveryId(deliveryId: number): Promise<DeliveryFileVersionSummary[]> {
    return prisma.delivery_files.findMany({
      where: { delivery_id: deliveryId },
      select: { id: true, delivery_id: true, file_name: true, size_bytes: true, version: true, created_at: true },
      orderBy: { version: 'desc' }
    });
  },

  async findVersionById(deliveryId: number, versionId: number): Promise<DeliveryFile | null> {
    const row = await prisma.delivery_files.findFirst({
      where: { delivery_id: deliveryId, id: versionId }
    });
    return row && { ...row, content: Buffer.from(row.content) };
  }
};
