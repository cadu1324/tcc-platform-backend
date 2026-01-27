import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStatus } from '../types/project.types';

export const projectRepository = {
  async findAll(): Promise<Project[]> {
    // TODO: Implementar
    return [];
  },

  async findById(id: string): Promise<Project | null> {
    // TODO: Implementar
    return null;
  },

  async findByStudentId(studentId: string): Promise<Project[]> {
    // TODO: Implementar
    return [];
  },

  async findByAdvisorId(advisorId: string): Promise<Project[]> {
    // TODO: Implementar
    return [];
  },

  async findByStudentIdAndStatus(studentId: string, status: ProjectStatus): Promise<Project | null> {
    // TODO: Implementar
    return null;
  },

  async create(data: CreateProjectDTO): Promise<Project> {
    // TODO: Implementar
    return {} as Project;
  },

  async update(id: string, data: UpdateProjectDTO): Promise<Project | null> {
    // TODO: Implementar
    return null;
  },

  async delete(id: string): Promise<boolean> {
    // TODO: Implementar
    return false;
  }
};
