import { Project } from '../types/project.types';
import { UserType, Requester } from '../types/user.types';
import { AppError } from '../middlewares/errorHandler';

function isProjectAdvisor(project: Project, requester: Requester): boolean {
  return requester.user_type === UserType.ADVISOR && project.advisor_id === requester.id;
}

export function assertCanManageMilestone(project: Project, requester: Requester): void {
  if (requester.user_type === UserType.ADMIN || isProjectAdvisor(project, requester)) {
    return;
  }
  throw new AppError('Only the project advisor can manage milestones', 403);
}
