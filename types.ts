export type UserRole = 'ADMIN' | 'INVITED';
export type Segment = 'YOUNG' | 'ADULT';
export type RSVPStatus = 'CONFIRMED' | 'DECLINED' | 'PENDING';

export interface Profile {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  segment: Segment | null;
  role: UserRole;
  is_celiac: boolean;
  avatar_url: string | null;
}

export interface Invite {
  code: string;
  segment: Segment;
  enabled: boolean;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export interface RSVP {
  user_id: string;
  status: RSVPStatus;
  note: string | null;
  updated_at: string;
}

export interface TableAssignment {
  user_id: string;
  table_label: string;
  updated_at: string;
}

export interface EventConfig {
  id: number;
  event_date: string; // ISO String
}
