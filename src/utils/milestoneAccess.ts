import { Project } from '../types/project.types';
import { UserType, Requester } from '../types/user.types';
import { AppError } from '../middlewares/errorHandler';

function isProjectAdvisor(project: Project, requester: Requester): boolean {
  return requester.user_type === UserType.ADVISOR && project.advisor_id === requester.id;
}

function isProjectStudent(project: Project, requester: Requester): boolean {
  return requester.user_type === UserType.STUDENT && project.student_id === requester.id;
}

// Create, content edits and deletion are the advisor's job (admins may always act).
export function assertCanManageMilestone(project: Project, requester: Requester): void {
  if (requester.user_type === UserType.ADMIN || isProjectAdvisor(project, requester)) {
    return;
  }
  throw new AppError('Only the project advisor can manage milestones', 403);
}

// Marking a milestone done (or reopening it) is open to either side of the project.
export function assertCanUpdateMilestoneStatus(project: Project, requester: Requester): void {
  if (
    requester.user_type === UserType.ADMIN ||
    isProjectAdvisor(project, requester) ||
    isProjectStudent(project, requester)
  ) {
    return;
  }
  throw new AppError('Only the project student or advisor can update this milestone', 403);
}
