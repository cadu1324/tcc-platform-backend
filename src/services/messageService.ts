import { Message, CreateMessageDTO, MessageContact, MessageContactRow } from '../types/message.types';
import { messageRepository } from '../repositories/messageRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { AppError } from '../middlewares/errorHandler';
import { UserType } from '../types/user.types';

const contactFinders = {
  [UserType.STUDENT]: (userId: number) => messageRepository.findContactsForStudent(userId),
  [UserType.ADVISOR]: (userId: number) => messageRepository.findContactsForAdvisor(userId),
  [UserType.ADMIN]: async (_userId: number): Promise<MessageContactRow[]> => []
} as const;

const toContact = (row: MessageContactRow): MessageContact => ({
  user_id: row.user_id,
  name: row.name,
  user_type: row.user_type,
  last_message: row.last_message,
  last_message_at: row.last_message_at ? row.last_message_at.toISOString() : null,
  unread_count: row.unread_count
});

async function assertValidContact(userId: number, otherUserId: number): Promise<void> {
  const valid = await messageRepository.isValidContact(userId, otherUserId);
  if (!valid) {
    throw new AppError('You can only exchange messages with your project advisor or student', 403);
  }
}

// Best-effort: the message is already persisted, so a notification failure must not
// fail the request. One unread MESSAGE_RECEIVED at a time keeps the bell from flooding
// during an active conversation.
async function notifyRecipient(senderId: number, recipientId: number): Promise<void> {
  try {
    if (await notificationService.hasUnread(recipientId, NotificationType.MESSAGE_RECEIVED)) {
      return;
    }
    const sender = await userRepository.findById(senderId);
    await notificationService.create({
      user_id: recipientId,
      type: NotificationType.MESSAGE_RECEIVED,
      message: `New message from ${sender?.name ?? 'a contact'}`
    });
  } catch (error) {
    console.error('Failed to create message notification', error);
  }
}

export const messageService = {
  async findContacts(userId: number, userType: UserType): Promise<MessageContact[]> {
    const rows = await contactFinders[userType](userId);
    return rows.map(toContact);
  },

  async findConversation(userId: number, otherUserId: number): Promise<Message[]> {
    await assertValidContact(userId, otherUserId);
    await messageRepository.markConversationRead(otherUserId, userId);
    return messageRepository.findConversation(userId, otherUserId);
  },

  async create(data: CreateMessageDTO): Promise<Message> {
    if (data.recipient_id === data.sender_id) {
      throw new AppError('Cannot send a message to yourself');
    }
    await assertValidContact(data.sender_id, data.recipient_id);
    const message = await messageRepository.create(data);
    await notifyRecipient(data.sender_id, data.recipient_id);
    return message;
  }
};
