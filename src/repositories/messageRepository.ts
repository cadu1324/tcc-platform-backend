import { query, queryOne } from '../config/database';
import { Message, CreateMessageDTO, MessageContactRow } from '../types/message.types';

// Builds the contact list query from a sub-select that yields the contact ids ($1 = current user).
const buildContactsQuery = (contactSource: string): string => `
  WITH contact_ids AS (${contactSource})
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
    WHERE (m.sender_id = $1 AND m.recipient_id = c.contact_id)
       OR (m.sender_id = c.contact_id AND m.recipient_id = $1)
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_message ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS count
    FROM messages m
    WHERE m.sender_id = c.contact_id
      AND m.recipient_id = $1
      AND m.is_read = false
  ) unread ON true
  ORDER BY last_message.created_at DESC NULLS LAST, u.name ASC
`;

export const messageRepository = {
  async findContactsForStudent(userId: number): Promise<MessageContactRow[]> {
    return query<MessageContactRow>(
      buildContactsQuery(
        `SELECT advisor_id AS contact_id FROM projects
         WHERE student_id = $1 AND advisor_id IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`
      ),
      [userId]
    );
  },

  async findContactsForAdvisor(userId: number): Promise<MessageContactRow[]> {
    return query<MessageContactRow>(
      buildContactsQuery(
        `SELECT DISTINCT student_id AS contact_id FROM projects
         WHERE advisor_id = $1 AND student_id IS NOT NULL`
      ),
      [userId]
    );
  },

  async isValidContact(userId: number, otherUserId: number): Promise<boolean> {
    const row = await queryOne<{ one: number }>(
      `SELECT 1 AS one FROM projects
       WHERE (student_id = $1 AND advisor_id = $2)
          OR (student_id = $2 AND advisor_id = $1)
       LIMIT 1`,
      [userId, otherUserId]
    );
    return row !== null;
  },

  async findConversation(userId: number, otherUserId: number): Promise<Message[]> {
    return query<Message>(
      `SELECT id, sender_id, recipient_id, content, is_read, created_at
       FROM messages
       WHERE (sender_id = $1 AND recipient_id = $2)
          OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY created_at ASC`,
      [userId, otherUserId]
    );
  },

  async markConversationRead(senderId: number, recipientId: number): Promise<void> {
    await query(
      `UPDATE messages SET is_read = true
       WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false`,
      [senderId, recipientId]
    );
  },

  async create(data: CreateMessageDTO): Promise<Message> {
    const result = await queryOne<Message>(
      `INSERT INTO messages (sender_id, recipient_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, recipient_id, content, is_read, created_at`,
      [data.sender_id, data.recipient_id, data.content]
    );
    return result!;
  }
};
