import { Delivery, DeliveryStatus } from '../types/project.types';
import type { Project } from '../types/project.types';
import type {
  DeliveryFile,
  SubmitDeliveryFileParams,
  GetDeliveryFileParams
} from '../types/deliveryFile.types';
import { UserType } from '../types/user.types';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { deliveryFileRepository } from '../repositories/deliveryFileRepository';
import { projectRepository } from '../repositories/projectRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { resolveDeliveryMimeType } from '../utils/deliveryFileMime';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

async function loadDeliveryWithProject(deliveryId: number): Promise<{ delivery: Delivery; project: Project }> {
  const delivery = await deliveryRepository.findById(deliveryId);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  const project = await projectRepository.findById(delivery.project_id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return { delivery, project };
}

export const deliveryFileService = {
  async submitWithFile({ deliveryId, userId, userType, file }: SubmitDeliveryFileParams): Promise<Delivery> {
    if (!file) {
      throw new AppError('File is required', 400);
    }

    if (file.size <= 0) {
      throw new AppError('File is empty', 400);
    }

    const mimeType = resolveDeliveryMimeType(file.originalname, file.mimetype);
    if (!mimeType) {
      throw new AppError('Only PDF, DOC and DOCX files are allowed', 415);
    }

    const { delivery, project } = await loadDeliveryWithProject(deliveryId);

    if (userType !== UserType.STUDENT || project.student_id !== userId) {
      throw new AppError('Only the project student can submit this delivery', 403);
    }

    if (delivery.status !== DeliveryStatus.PENDING && delivery.status !== DeliveryStatus.REJECTED) {
      throw new AppError('Delivery has already been submitted', 409);
    }

    await deliveryFileRepository.upsert({
      delivery_id: deliveryId,
      file_name: file.originalname,
      mime_type: mimeType,
      size_bytes: file.size,
      content: file.buffer
    });

    const updated = await deliveryRepository.update(deliveryId, {
      status: DeliveryStatus.SUBMITTED,
      submitted_at: new Date(),
      file_url: `${env.publicApiUrl}/api/deliveries/${deliveryId}/file`,
      file_name: file.originalname
    });

    if (project.advisor_id) {
      await notificationService.create({
        user_id: project.advisor_id,
        type: NotificationType.DELIVERY_CREATED,
        message: `Delivery "${delivery.title}" was submitted for project "${project.title}"`,
        project_id: project.id
      });
    }

    return updated!;
  },

  async getFileForUser({ deliveryId, userId, userType }: GetDeliveryFileParams): Promise<DeliveryFile> {
    const { project } = await loadDeliveryWithProject(deliveryId);

    const isOwnerStudent = userType === UserType.STUDENT && project.student_id === userId;
    const isProjectAdvisor = userType === UserType.ADVISOR && project.advisor_id === userId;
    const isAdmin = userType === UserType.ADMIN;
    if (!isOwnerStudent && !isProjectAdvisor && !isAdmin) {
      throw new AppError('You are not allowed to access this file', 403);
    }

    const file = await deliveryFileRepository.findByDeliveryId(deliveryId);
    if (!file) {
      throw new AppError('No file found for this delivery', 404);
    }

    return file;
  }
};
