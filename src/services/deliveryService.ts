import { Delivery, DeliveryWithMilestone, CreateDeliveryDTO, UpdateDeliveryDTO } from '../types/project.types';
import { UserType, Requester } from '../types/user.types';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { projectRepository } from '../repositories/projectRepository';
import { milestoneRepository } from '../repositories/milestoneRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { assertCanAccessProject } from '../utils/projectAccess';
import { AppError } from '../middlewares/errorHandler';

export const deliveryService = {
  async findAll(requester: Requester): Promise<Delivery[]> {
    if (requester.user_type !== UserType.ADMIN) {
      throw new AppError('Only an admin can list all deliveries', 403);
    }
    return deliveryRepository.findAll();
  },

  async findById(id: number, requester: Requester): Promise<Delivery> {
    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    const project = await projectRepository.findById(delivery.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    assertCanAccessProject(project, requester);

    return delivery;
  },

  async findByProjectId(projectId: number, requester: Requester): Promise<DeliveryWithMilestone[]> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    assertCanAccessProject(project, requester);

    return deliveryRepository.findByProjectId(projectId);
  },

  async create(data: CreateDeliveryDTO, requester: Requester): Promise<Delivery> {
    if (!data.project_id || !data.milestone_id || !data.title || !data.description) {
      throw new AppError('Project id, milestone id, title and description are required');
    }

    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    assertCanAccessProject(project, requester);

    const milestone = await milestoneRepository.findById(data.milestone_id);
    if (!milestone || milestone.project_id !== data.project_id) {
      throw new AppError('Milestone does not belong to this project', 400);
    }

    const delivery = await deliveryRepository.create({ ...data, deadline: milestone.due_date ?? undefined });

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

  async update(id: number, data: UpdateDeliveryDTO, requester: Requester): Promise<Delivery> {
    const existing = await deliveryRepository.findById(id);
    if (!existing) {
      throw new AppError('Delivery not found', 404);
    }

    const project = await projectRepository.findById(existing.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdvisor = requester.user_type === UserType.ADVISOR && project.advisor_id === requester.id;
    const isAdmin = requester.user_type === UserType.ADMIN;
    if (!isAdvisor && !isAdmin) {
      throw new AppError('Only the project advisor can review this delivery', 403);
    }

    const updated = await deliveryRepository.update(id, data);
    if (!updated) {
      throw new AppError('No fields to update');
    }

    return updated;
  },

  async delete(id: number, requester: Requester): Promise<void> {
    if (requester.user_type !== UserType.ADMIN) {
      throw new AppError('Only an admin can delete a delivery', 403);
    }

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
