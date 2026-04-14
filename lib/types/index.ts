export interface User {
  id: string
  email?: string
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

export interface Session {
  user: User
}

// Profile types
export type Species = 'human' | 'pet'

export type Relationship =
  | 'father'
  | 'mother'
  | 'grandfather'
  | 'grandmother'
  | 'maternal_grandfather'
  | 'maternal_grandmother'
  | 'spouse'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'pet_cat'
  | 'pet_dog'
  | 'pet_other'
  | 'other'

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  father: '父亲',
  mother: '母亲',
  grandfather: '爷爷',
  grandmother: '奶奶',
  maternal_grandfather: '外公',
  maternal_grandmother: '外婆',
  spouse: '配偶',
  child: '子女',
  sibling: '兄弟姐妹',
  friend: '朋友',
  pet_cat: '宠物-猫',
  pet_dog: '宠物-狗',
  pet_other: '宠物-其他',
  other: '其他',
}

export const PET_RELATIONSHIPS: Relationship[] = ['pet_cat', 'pet_dog', 'pet_other']

export function isPetRelationship(rel: Relationship): boolean {
  return PET_RELATIONSHIPS.includes(rel)
}

export interface Profile {
  id: string
  user_id: string
  name: string
  avatar_path: string | null
  birth_date: string | null
  death_date: string | null
  relationship: Relationship
  species: Species
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProfileWithMemoryCount extends Profile {
  memory_count: number
}

export interface CreateProfileInput {
  name: string
  avatar_path?: string | null
  birth_date?: string | null
  death_date?: string | null
  relationship: Relationship
  species?: Species
  description?: string | null
}

export type UpdateProfileInput = Partial<CreateProfileInput>

// Memory types
export type MemoryType = 'photo' | 'video' | 'audio' | 'text' | 'document'

export type DatePrecision = 'day' | 'month' | 'year' | 'unknown'

export interface Memory {
  id: string
  profile_id: string
  contributor_id: string
  type: MemoryType
  file_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  thumbnail_path: string | null
  duration_seconds: number | null
  content: string | null
  memory_date: string | null
  memory_date_precision: DatePrecision
  tags: string[]
  annotation: string | null
  source_label: string
  import_source: 'upload' | 'wechat_import'
  exif_data: Record<string, unknown> | null
  sort_order: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateMemoryInput {
  profile_id: string
  type: MemoryType
  file_path?: string | null
  file_name?: string | null
  file_size?: number | null
  mime_type?: string | null
  thumbnail_path?: string | null
  duration_seconds?: number | null
  content?: string | null
  memory_date?: string | null
  memory_date_precision?: DatePrecision
  tags?: string[]
  annotation?: string | null
  source_label?: string
  import_source?: 'upload' | 'wechat_import'
  exif_data?: Record<string, unknown> | null
}

export interface MemoryFilters {
  type?: MemoryType
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

// Family Member types
export type FamilyRole = 'admin' | 'editor' | 'viewer'

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  admin: '管理员',
  editor: '编辑',
  viewer: '查看',
}

export interface FamilyMember {
  id: string
  profile_id: string
  user_id: string | null
  invited_email: string | null
  display_name: string | null
  role: FamilyRole
  invite_token: string | null
  invited_by: string
  invited_at: string
  accepted_at: string | null
  deleted_at: string | null
}

export interface FamilyMemberWithUser extends FamilyMember {
  user_email?: string
  user_name?: string
  user_avatar_url?: string
}

export interface InviteDetails {
  id: string
  profile_id: string
  role: FamilyRole
  invited_email: string | null
  invited_at: string
  profile_name: string
  profile_avatar_path: string | null
}

// Reminder types
export type Recurrence = 'once' | 'yearly' | 'lunar_yearly'

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: '一次性',
  yearly: '每年',
  lunar_yearly: '农历每年',
}

export interface Reminder {
  id: string
  profile_id: string
  user_id: string
  title: string
  reminder_date: string
  recurrence: Recurrence
  enabled: boolean
  created_at: string
}

export interface CreateReminderInput {
  profile_id: string
  title: string
  reminder_date: string
  recurrence: Recurrence
}

export type UpdateReminderInput = Partial<CreateReminderInput>
