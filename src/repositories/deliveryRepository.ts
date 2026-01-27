import { Delivery, CreateDeliveryDTO, UpdateDeliveryDTO } from '../types/project.types';

export const deliveryRepository = {
  async findAll(): Promise<Delivery[]> {
    // TODO: Implementar
    return [];
  },

  async findById(id: string): Promise<Delivery | null> {
    // TODO: Implementar
    return null;
  },

  async findByProjectId(projectId: string): Promise<Delivery[]> {
    // TODO: Implementar
    return [];
  },

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    // TODO: Implementar
    return {} as Delivery;
  },

  async update(id: string, data: UpdateDeliveryDTO): Promise<Delivery | null> {
    // TODO: Implementar
    return null;
  },

  async delete(id: string): Promise<boolean> {
    // TODO: Implementar
    return false;
  }
};
