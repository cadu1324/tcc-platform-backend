import { Message, CreateMessageDTO, MessageContact, MessageContactRow } from '../types/message.types';
import { messageRepository } from '../repositories/messageRepository';
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
    return messageRepository.create(data);
  }
};
