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
