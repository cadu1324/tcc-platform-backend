import { Milestone, CreateMilestoneDTO, UpdateMilestoneDTO } from '../types/milestone.types';
import { Project } from '../types/project.types';
import { milestoneRepository } from '../repositories/milestoneRepository';
import { projectRepository } from '../repositories/projectRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { AppError } from '../middlewares/errorHandler';

async function notifyMilestoneChange(
  project: Project,
  type: NotificationType,
  message: string
): Promise<void> {
  const recipientIds = [project.student_id, project.advisor_id].filter(
    (id): id is number => id !== null
  );

  await Promise.all(
    recipientIds.map((userId) =>
      notificationService.create({
        user_id: userId,
        type,
        message,
        project_id: project.id
      })
    )
  );
}

export const milestoneService = {
  async findAll(): Promise<Milestone[]> {
    return milestoneRepository.findAll();
  },

  async findById(id: number): Promise<Milestone> {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }
    return milestone;
  },

  async findByProjectId(projectId: number): Promise<Milestone[]> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return milestoneRepository.findByProjectId(projectId);
  },

  async create(data: CreateMilestoneDTO): Promise<Milestone> {
    if (!data.project_id || !data.title) {
      throw new AppError('Project id and title are required');
    }

    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const milestone = await milestoneRepository.create(data);

    await notifyMilestoneChange(
      project,
      NotificationType.MILESTONE_CREATED,
      `New milestone "${milestone.title}" was added to project "${project.title}"`
    );

    return milestone;
  },

  async update(id: number, data: UpdateMilestoneDTO): Promise<Milestone> {
    const existing = await milestoneRepository.findById(id);
    if (!existing) {
      throw new AppError('Milestone not found', 404);
    }

    const updated = await milestoneRepository.update(id, data);
    if (!updated) {
      throw new AppError('No fields to update');
    }

    const project = await projectRepository.findById(updated.project_id);
    if (project) {
      await notifyMilestoneChange(
        project,
        NotificationType.MILESTONE_UPDATED,
        `Milestone "${updated.title}" was updated`
      );
    }

    return updated;
  },

  async delete(id: number): Promise<void> {
    const existing = await milestoneRepository.findById(id);
    if (!existing) {
      throw new AppError('Milestone not found', 404);
    }

    const deleted = await milestoneRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete milestone');
    }
  }
};
