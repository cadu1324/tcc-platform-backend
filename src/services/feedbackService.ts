import { Feedback, CreateFeedbackDTO } from '../types/feedback.types';
import { Requester } from '../types/user.types';
import { prisma } from '../config/prisma';
import { feedbackRepository } from '../repositories/feedbackRepository';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { projectRepository } from '../repositories/projectRepository';
import { notificationService } from './notificationService';
import { notificationSettingsService } from './notificationSettingsService';
import { NotificationType } from '../types/notification.types';
import { assertCanAccessProject } from '../utils/projectAccess';
import { AppError } from '../middlewares/errorHandler';

export const feedbackService = {
  async findByDeliveryId(deliveryId: number, requester: Requester): Promise<Feedback[]> {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    const project = await projectRepository.findById(delivery.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    assertCanAccessProject(project, requester);

    return feedbackRepository.findByDeliveryId(deliveryId);
  },

  async create(data: CreateFeedbackDTO): Promise<Feedback> {
    if (!data.delivery_id || !data.comment || data.grade === undefined) {
      throw new AppError('Delivery id, comment and grade are required');
    }

    if (data.grade < 0 || data.grade > 10) {
      throw new AppError('Grade must be between 0 and 10');
    }

    const delivery = await deliveryRepository.findById(data.delivery_id);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    const project = await projectRepository.findById(delivery.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.advisor_id !== data.advisor_id) {
      throw new AppError('Only the project advisor can give feedback on this delivery', 403);
    }

    const feedback = await prisma.$transaction(async (tx) => {
      const created = await feedbackRepository.create(data, tx);
      await deliveryRepository.update(data.delivery_id, { status: data.status }, tx);
      return created;
    });

    const settings = await notificationSettingsService.get();
    if (settings.notify_student_on_feedback) {
      await notificationService.create({
        user_id: project.student_id,
        type: NotificationType.FEEDBACK_REGISTERED,
        message: `New feedback was registered on delivery "${delivery.title}"`,
        project_id: project.id
      });
    }

    return feedback;
  }
};
