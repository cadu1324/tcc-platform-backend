import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/prisma';
import { Message, CreateMessageDTO, MessageContactRow } from '../types/message.types';

// LATERAL joins mantidos como SQL raw via Prisma.sql: mais direto do que
// reescrever ultima-mensagem-por-contato e contagem-de-nao-lidas no query
// builder. Prisma.sql compoe fragmentos com interpolacao parametrizada
// (sem risco de injection).
function contactsQuery(contactIds: Prisma.Sql, userId: number): Prisma.Sql {
  return Prisma.sql`
    WITH contact_ids AS (${contactIds})
    SELECT
      u.id AS user_id,
      u.name,
      u.user_type,
      last_message.content AS last_message,
      last_message.created_at AS last_message_at,
      COALESCE(unread.count, 0)::int AS unread_count
    FROM contact_ids c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN LATERAL (
      SELECT m.content, m.created_at
      FROM messages m
      WHERE (m.sender_id = ${userId} AND m.recipient_id = c.contact_id)
         OR (m.sender_id = c.contact_id AND m.recipient_id = ${userId})
      ORDER BY m.created_at DESC
      LIMIT 1
    ) last_message ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS count
      FROM messages m
      WHERE m.sender_id = c.contact_id
        AND m.recipient_id = ${userId}
        AND m.is_read = false
    ) unread ON true
    ORDER BY last_message.created_at DESC NULLS LAST, u.name ASC
  `;
}

export const messageRepository = {
  async findContactsForStudent(userId: number): Promise<MessageContactRow[]> {
    const contactIds = Prisma.sql`
      SELECT advisor_id AS contact_id FROM projects
      WHERE student_id = ${userId} AND advisor_id IS NOT NULL
      ORDER BY created_at DESC LIMIT 1
    `;
    return prisma.$queryRaw<MessageContactRow[]>(contactsQuery(contactIds, userId));
  },

  async findContactsForAdvisor(userId: number): Promise<MessageContactRow[]> {
    const contactIds = Prisma.sql`
      SELECT DISTINCT student_id AS contact_id FROM projects
      WHERE advisor_id = ${userId} AND student_id IS NOT NULL
    `;
    return prisma.$queryRaw<MessageContactRow[]>(contactsQuery(contactIds, userId));
  },

  async isValidContact(userId: number, otherUserId: number): Promise<boolean> {
    const project = await prisma.projects.findFirst({
      where: {
        OR: [
          { student_id: userId, advisor_id: otherUserId },
          { student_id: otherUserId, advisor_id: userId }
        ]
      },
      select: { id: true }
    });
    return project !== null;
  },

  async findConversation(userId: number, otherUserId: number): Promise<Message[]> {
    return prisma.messages.findMany({
      where: {
        OR: [
          { sender_id: userId, recipient_id: otherUserId },
          { sender_id: otherUserId, recipient_id: userId }
        ]
      },
      select: { id: true, sender_id: true, recipient_id: true, content: true, is_read: true, created_at: true },
      orderBy: { created_at: 'asc' }
    });
  },

  async markConversationRead(senderId: number, recipientId: number): Promise<void> {
    await prisma.messages.updateMany({
      where: { sender_id: senderId, recipient_id: recipientId, is_read: false },
      data: { is_read: true }
    });
  },

  async create(data: CreateMessageDTO): Promise<Message> {
    return prisma.messages.create({
      data: { sender_id: data.sender_id, recipient_id: data.recipient_id, content: data.content },
      select: { id: true, sender_id: true, recipient_id: true, content: true, is_read: true, created_at: true }
    });
  }
};
