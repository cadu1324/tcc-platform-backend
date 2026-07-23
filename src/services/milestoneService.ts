import { Milestone, CreateMilestoneDTO, UpdateMilestoneDTO } from '../types/milestone.types';
import { milestoneRepository } from '../repositories/milestoneRepository';
import { projectRepository } from '../repositories/projectRepository';
import { AppError } from '../middlewares/errorHandler';

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

    return milestoneRepository.create(data);
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
