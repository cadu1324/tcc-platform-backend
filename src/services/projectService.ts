import { Project, CreateProjectDTO, UpdateProjectDTO } from '../types/project.types';
import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middlewares/errorHandler';

export const projectService = {
  async findAll(): Promise<Project[]> {
    return projectRepository.findAll();
  },

  async findById(id: number): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  },

  async findByStudentId(studentId: number): Promise<Project[]> {
    return projectRepository.findByStudentId(studentId);
  },

  async findByAdvisorId(advisorId: number): Promise<Project[]> {
    return projectRepository.findByAdvisorId(advisorId);
  },

  async create(data: CreateProjectDTO): Promise<Project> {
    if (!data.title || !data.description || !data.student_id) {
      throw new AppError('Title, description and student id are required');
    }

    const student = await userRepository.findById(data.student_id);
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (data.advisor_id) {
      const advisor = await userRepository.findById(data.advisor_id);
      if (!advisor) {
        throw new AppError('Advisor not found', 404);
      }
    }

    return projectRepository.create(data);
  },

  async update(id: number, data: UpdateProjectDTO): Promise<Project> {
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new AppError('Project not found', 404);
    }

    if (data.advisor_id) {
      const advisor = await userRepository.findById(data.advisor_id);
      if (!advisor) {
        throw new AppError('Advisor not found', 404);
      }
    }

    const updated = await projectRepository.update(id, data);
    if (!updated) {
      throw new AppError('No fields to update');
    }

    return updated;
  },

  async delete(id: number): Promise<void> {
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new AppError('Project not found', 404);
    }

    const deleted = await projectRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete project');
    }
  }
};
