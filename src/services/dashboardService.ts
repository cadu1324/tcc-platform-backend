import { UserType } from '../types/user.types';
import { StudentDashboard, AdvisorDashboard, AdminDashboard } from '../types/dashboard.types';
import { studentDashboardRepository } from '../repositories/studentDashboardRepository';
import { advisorDashboardRepository } from '../repositories/advisorDashboardRepository';
import { adminDashboardRepository } from '../repositories/adminDashboardRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { projectRepository } from '../repositories/projectRepository';

const UPCOMING_MILESTONES_LIMIT = 5;
const RECENT_FEEDBACKS_LIMIT = 5;
const ADVISOR_LIST_LIMIT = 10;

async function buildStudentDashboard(userId: number): Promise<StudentDashboard> {
  const [project] = await projectRepository.findByStudentId(userId);
  const unreadNotifications = await notificationRepository.countUnreadByUserId(userId);

  if (!project) {
    return {
      project: null,
      deliveries: { pending: 0, submitted: 0, approved: 0, rejected: 0 },
      milestones: { pending: 0, completed: 0 },
      upcoming_milestones: [],
      recent_feedbacks: [],
      unread_notifications: unreadNotifications
    };
  }

  const [deliveries, milestones, upcomingMilestones, recentFeedbacks] = await Promise.all([
    studentDashboardRepository.getDeliveryStatusCounts(project.id),
    studentDashboardRepository.getMilestoneStatusCounts(project.id),
    studentDashboardRepository.getUpcomingMilestones(project.id, UPCOMING_MILESTONES_LIMIT),
    studentDashboardRepository.getLatestFeedbacks(project.id, RECENT_FEEDBACKS_LIMIT)
  ]);

  return {
    project,
    deliveries,
    milestones,
    upcoming_milestones: upcomingMilestones,
    recent_feedbacks: recentFeedbacks,
    unread_notifications: unreadNotifications
  };
}

async function buildAdvisorDashboard(userId: number): Promise<AdvisorDashboard> {
  const [projects, deliveriesAwaitingFeedback, overdueMilestones, unreadNotifications] = await Promise.all([
    advisorDashboardRepository.getProjectStatusCounts(userId),
    advisorDashboardRepository.getDeliveriesAwaitingFeedback(userId, ADVISOR_LIST_LIMIT),
    advisorDashboardRepository.getOverdueMilestones(userId, ADVISOR_LIST_LIMIT),
    notificationRepository.countUnreadByUserId(userId)
  ]);

  return {
    projects,
    deliveries_awaiting_feedback: deliveriesAwaitingFeedback,
    overdue_milestones: overdueMilestones,
    unread_notifications: unreadNotifications
  };
}

async function buildAdminDashboard(): Promise<AdminDashboard> {
  const [users, projects, deliveries, projectsWithoutAdvisor, overdueMilestonesCount] = await Promise.all([
    adminDashboardRepository.getUserCountsByType(),
    adminDashboardRepository.getProjectStatusCounts(),
    adminDashboardRepository.getDeliveryStatusCounts(),
    adminDashboardRepository.getProjectsWithoutAdvisorCount(),
    adminDashboardRepository.getOverdueMilestonesCount()
  ]);

  return {
    users,
    projects,
    deliveries,
    projects_without_advisor: projectsWithoutAdvisor,
    overdue_milestones_count: overdueMilestonesCount
  };
}

export const dashboardService = {
  async getForUser(
    userId: number,
    userType: UserType
  ): Promise<StudentDashboard | AdvisorDashboard | AdminDashboard> {
    if (userType === UserType.STUDENT) {
      return buildStudentDashboard(userId);
    }

    if (userType === UserType.ADVISOR) {
      return buildAdvisorDashboard(userId);
    }

    return buildAdminDashboard();
  }
};
