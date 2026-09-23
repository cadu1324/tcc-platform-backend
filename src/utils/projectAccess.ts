import { Project } from '../types/project.types';
import { UserType, Requester } from '../types/user.types';
import { AppError } from '../middlewares/errorHandler';

export function isProjectMember(project: Project, requester: Requester): boolean {
  return (
    requester.user_type === UserType.ADMIN ||
    (requester.user_type === UserType.STUDENT && project.student_id === requester.id) ||
    (requester.user_type === UserType.ADVISOR && project.advisor_id === requester.id)
  );
}

export function assertCanAccessProject(project: Project, requester: Requester): void {
  if (!isProjectMember(project, requester)) {
    throw new AppError('You are not allowed to access this project', 403);
  }
}
