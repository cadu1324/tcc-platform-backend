import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStatus } from '../types/project.types';
import { UserType, Requester } from '../types/user.types';
import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middlewares/errorHandler';

export const projectService = {
  async findAll(requester: Requester): Promise<Project[]> {
    if (requester.user_type === UserType.STUDENT) {
      return projectRepository.findByStudentId(requester.id);
    }
    if (requester.user_type === UserType.ADVISOR) {
      return projectRepository.findByAdvisorIdWithStats(requester.id);
    }
    return projectRepository.findAllWithStats();
  },

  async findById(id: number, requester: Requester): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const canView =
      requester.user_type === UserType.ADMIN ||
      (requester.user_type === UserType.STUDENT && project.student_id === requester.id) ||
      (requester.user_type === UserType.ADVISOR && project.advisor_id === requester.id);
    if (!canView) {
      throw new AppError('You are not allowed to view this project', 403);
    }

    return project;
  },

  async findByStudentId(studentId: number): Promise<Project[]> {
    return projectRepository.findByStudentId(studentId);
  },

  async findByAdvisorId(advisorId: number): Promise<Project[]> {
    return projectRepository.findByAdvisorId(advisorId);
  },

  async create(data: CreateProjectDTO, requester: Requester): Promise<Project> {
    // A student can only open a project for themselves; admins/advisors pick the student.
    const studentId = requester.user_type === UserType.STUDENT ? requester.id : data.student_id;
    const payload = { ...data, student_id: studentId };

    if (!payload.title || !payload.description || !payload.student_id || !payload.advisor_id) {
      throw new AppError('Title, description, student id and advisor id are required');
    }

    const student = await userRepository.findById(payload.student_id);
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const advisor = await userRepository.findById(payload.advisor_id);
    if (!advisor) {
      throw new AppError('Advisor not found', 404);
    }

    const activeProject = await projectRepository.findByStudentIdAndStatus(
      payload.student_id,
      ProjectStatus.IN_PROGRESS
    );
    if (activeProject) {
      throw new AppError('Student already has a project in progress');
    }

    return projectRepository.create(payload);
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

    if (data.status === ProjectStatus.IN_PROGRESS && existing.status !== ProjectStatus.IN_PROGRESS) {
      const activeProject = await projectRepository.findByStudentIdAndStatus(
        existing.student_id,
        ProjectStatus.IN_PROGRESS
      );
      if (activeProject) {
        throw new AppError('Student already has a project in progress');
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
