'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Relationship, Species } from '@/lib/types'
import { isPetRelationship } from '@/lib/types'
import { createProfile, updateProfile, type ProfileState } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  profile?: Profile
  mode: 'create' | 'edit'
}

const initialState: ProfileState = {
  error: null,
  success: false,
}

export function ProfileForm({ profile, mode }: ProfileFormProps) {
  const router = useRouter()
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship>(
    profile?.relationship || 'father'
  )
  const [species, setSpecies] = useState<Species>(
    profile?.species || (isPetRelationship(profile?.relationship as Relationship) ? 'pet' : 'human')
  )

  const action = mode === 'create' ? createProfile : updateProfile.bind(null, profile?.id || '')
  const [state, formAction, isPending] = useActionState(action, initialState)

  // Auto-set species when relationship changes
  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rel = e.target.value as Relationship
    setSelectedRelationship(rel)
    if (isPetRelationship(rel)) {
      setSpecies('pet')
    } else {
      setSpecies('human')
    }
  }

  // Redirect on success
  if (state.success && state.profileId) {
    router.push(`/profile/${state.profileId}`)
    router.refresh()
  }

  if (state.success && mode === 'create') {
    // For create, the server action will redirect
    return null
  }

  const relationshipOptions: { value: Relationship; label: string }[] = [
    { value: 'father', label: '父亲' },
    { value: 'mother', label: '母亲' },
    { value: 'grandfather', label: '爷爷' },
    { value: 'grandmother', label: '奶奶' },
    { value: 'maternal_grandfather', label: '外公' },
    { value: 'maternal_grandmother', label: '外婆' },
    { value: 'spouse', label: '配偶' },
    { value: 'child', label: '子女' },
    { value: 'sibling', label: '兄弟姐妹' },
    { value: 'friend', label: '朋友' },
    { value: 'pet_cat', label: '宠物-猫' },
    { value: 'pet_dog', label: '宠物-狗' },
    { value: 'pet_other', label: '宠物-其他' },
    { value: 'other', label: '其他' },
  ]

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Message */}
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-stone-700">
          姓名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="请输入姓名"
          defaultValue={profile?.name || ''}
          required
          maxLength={100}
          disabled={isPending}
          className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
        />
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <Label htmlFor="relationship" className="text-stone-700">
          与 TA 的关系 <span className="text-red-500">*</span>
        </Label>
        <select
          id="relationship"
          name="relationship"
          value={selectedRelationship}
          onChange={handleRelationshipChange}
          disabled={isPending}
          className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {relationshipOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input type="hidden" name="species" value={species} />
      </div>

      {/* Species (hidden, auto-set based on relationship) */}
      <div className="space-y-2">
        <Label className="text-stone-700">类型</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="species_display"
              value="human"
              checked={species === 'human'}
              onChange={() => setSpecies('human')}
              disabled={isPending || isPetRelationship(selectedRelationship)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-600"
            />
            <span className="text-sm text-stone-600">人类</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="species_display"
              value="pet"
              checked={species === 'pet'}
              onChange={() => setSpecies('pet')}
              disabled={isPending}
              className="h-4 w-4 text-amber-600 focus:ring-amber-600"
            />
            <span className="text-sm text-stone-600">宠物</span>
          </label>
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <Label htmlFor="birth_date" className="text-stone-700">
          出生日期
        </Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          defaultValue={profile?.birth_date || ''}
          disabled={isPending}
          className="border-stone-300 bg-white text-stone-800 focus-visible:ring-amber-600"
        />
        <p className="text-xs text-stone-400">如果不确定具体日期，可以只填写知道的范围</p>
      </div>

      {/* Death Date */}
      <div className="space-y-2">
        <Label htmlFor="death_date" className="text-stone-700">
          去世日期
        </Label>
        <Input
          id="death_date"
          name="death_date"
          type="date"
          defaultValue={profile?.death_date || ''}
          disabled={isPending}
          className="border-stone-300 bg-white text-stone-800 focus-visible:ring-amber-600"
        />
        <p className="text-xs text-stone-400">如果还在世或不确定，可以不填写</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-stone-700">
          一句话描述
        </Label>
        <textarea
          id="description"
          name="description"
          placeholder='用一句话描述 TA，比如"最爱听京剧的老顽童"'
          defaultValue={profile?.description || ''}
          disabled={isPending}
          maxLength={500}
          rows={3}
          className="flex w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base ring-offset-background placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        <p className="text-xs text-stone-400">最多500个字符</p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150"
        >
          {isPending ? '保存中...' : mode === 'create' ? '创建记忆空间' : '保存修改'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl"
        >
          取消
        </Button>
      </div>
    </form>
  )
}
