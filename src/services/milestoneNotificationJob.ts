import type { MilestoneWithProject } from '../types/milestone.types';
import { NotificationType } from '../types/notification.types';
import { milestoneRepository } from '../repositories/milestoneRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationService } from './notificationService';
import { notificationSettingsService } from './notificationSettingsService';

async function notifyIfNew(
  userId: number,
  type: NotificationType,
  projectId: number,
  message: string
): Promise<void> {
  const alreadyNotified = await notificationRepository.existsExact(userId, type, projectId, message);
  if (alreadyNotified) return;

  await notificationService.create({ user_id: userId, type, message, project_id: projectId });
}

function isOverdue(milestone: MilestoneWithProject): boolean {
  if (!milestone.due_date) return false;
  const todayStart = new Date(new Date().toDateString());
  return new Date(milestone.due_date) < todayStart;
}

export async function checkMilestoneDeadlines(): Promise<void> {
  const milestones = await milestoneRepository.findDueSoonOrOverdue();
  const settings = await notificationSettingsService.get();
  const admins = settings.notify_admin_on_milestone_overdue ? await userRepository.findAdmins() : [];

  for (const milestone of milestones) {
    const dueDate = milestone.due_date ? new Date(milestone.due_date).toISOString().slice(0, 10) : '';
    const recipients = [milestone.student_id, milestone.advisor_id].filter(
      (id): id is number => id !== null
    );

    if (isOverdue(milestone)) {
      const message = `Milestone "${milestone.title}" for project "${milestone.project_title}" is overdue (was due ${dueDate})`;

      for (const userId of recipients) {
        await notifyIfNew(userId, NotificationType.MILESTONE_OVERDUE, milestone.project_id, message);
      }
      for (const admin of admins) {
        await notifyIfNew(admin.id, NotificationType.MILESTONE_OVERDUE, milestone.project_id, message);
      }
    } else {
      const message = `Milestone "${milestone.title}" for project "${milestone.project_title}" is due soon (${dueDate})`;

      for (const userId of recipients) {
        await notifyIfNew(userId, NotificationType.MILESTONE_DUE_SOON, milestone.project_id, message);
      }
    }
  }
}
