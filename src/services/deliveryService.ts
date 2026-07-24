import { Delivery, CreateDeliveryDTO, UpdateDeliveryDTO } from '../types/project.types';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { projectRepository } from '../repositories/projectRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { AppError } from '../middlewares/errorHandler';

export const deliveryService = {
  async findAll(): Promise<Delivery[]> {
    return deliveryRepository.findAll();
  },

  async findById(id: number): Promise<Delivery> {
    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }
    return delivery;
  },

  async findByProjectId(projectId: number): Promise<Delivery[]> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return deliveryRepository.findByProjectId(projectId);
  },

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    if (!data.project_id || !data.title || !data.description) {
      throw new AppError('Project id, title and description are required');
    }

    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const delivery = await deliveryRepository.create(data);

    if (project.advisor_id) {
      await notificationService.create({
        user_id: project.advisor_id,
        type: NotificationType.DELIVERY_CREATED,
        message: `New delivery "${delivery.title}" was submitted for project "${project.title}"`,
        project_id: project.id
      });
    }

    return delivery;
  },

  async update(id: number, data: UpdateDeliveryDTO): Promise<Delivery> {
    const existing = await deliveryRepository.findById(id);
    if (!existing) {
      throw new AppError('Delivery not found', 404);
    }

    const updated = await deliveryRepository.update(id, data);
    if (!updated) {
      throw new AppError('No fields to update');
    }

    return updated;
  },

  async delete(id: number): Promise<void> {
    const existing = await deliveryRepository.findById(id);
    if (!existing) {
      throw new AppError('Delivery not found', 404);
    }

    const deleted = await deliveryRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete delivery');
    }
  }
};
