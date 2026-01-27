import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStatus } from '../types/project.types';

// Regra de negócio: Student can only have one project with status in_progress at a time

export const projectService = {
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

  async create(data: CreateProjectDTO): Promise<Project> {
    // TODO: Implementar
    // Verificar regra: aluno não pode ter outro projeto in_progress
    return {} as Project;
  },

  async update(id: string, data: UpdateProjectDTO): Promise<Project | null> {
    // TODO: Implementar
    // Se mudando status para in_progress, verificar regra
    return null;
  },

  async delete(id: string): Promise<boolean> {
    // TODO: Implementar
    return false;
  }
};
