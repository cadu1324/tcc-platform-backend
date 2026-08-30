import { UserType } from './user.types';

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export interface CreateMessageDTO {
  sender_id: number;
  recipient_id: number;
  content: string;
}

export interface MessageContact {
  user_id: number;
  name: string;
  user_type: UserType;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

// Same shape as MessageContact, but as returned by the database (raw timestamp).
export interface MessageContactRow {
  user_id: number;
  name: string;
  user_type: UserType;
  last_message: string | null;
  last_message_at: Date | null;
  unread_count: number;
}
