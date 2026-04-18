'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Relationship, Species } from '@/lib/types'
import { isPetRelationship } from '@/lib/types'
import { createProfile, updateProfile, type ProfileState } from '@/lib/actions/profile'
import { uploadMemoryFile } from '@/lib/actions/upload'
import { Camera, Sparkles } from 'lucide-react'

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

  // Cover photo state
  const [coverPhotoPath, setCoverPhotoPath] = useState<string | null>(profile?.cover_photo_path || null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const action = mode === 'create' ? createProfile : updateProfile.bind(null, profile?.id || '')
  const [state, formAction, isPending] = useActionState(action, initialState)

  const getCoverPhotoUrl = (path: string | null): string | null => {
    if (!path) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
  }

  const getAvatarUrl = (): string | null => {
    if (!profile?.avatar_path) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profile.avatar_path}`
  }

  useEffect(() => {
    if (coverPhotoPath) {
      setCoverPhotoPreview(getCoverPhotoUrl(coverPhotoPath))
    } else if (profile?.avatar_path) {
      setCoverPhotoPreview(getAvatarUrl())
    } else {
      setCoverPhotoPreview(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverPhotoPath, profile?.avatar_path])

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rel = e.target.value as Relationship
    setSelectedRelationship(rel)
    if (isPetRelationship(rel)) {
      setSpecies('pet')
    } else {
      setSpecies('human')
    }
  }

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    setUploadError(null)
    setIsUploadingCover(true)

    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `cover_${Date.now()}.${fileExt}`

      const result = await uploadMemoryFile('avatars', profile.id, 'cover', fileName, file)

      if (result.success && result.filePath) {
        setCoverPhotoPath(result.filePath)
      } else {
        setUploadError(result.error || '上传照片失败')
      }
    } catch {
      setUploadError('上传照片失败')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleRemoveCoverPhoto = () => {
    setCoverPhotoPath(null)
    setCoverPhotoPreview(getAvatarUrl())
  }

  if (state.success && state.profileId) {
    router.push(`/profile/${state.profileId}`)
    router.refresh()
  }

  if (state.success && mode === 'create') {
    return null
  }

  const relationshipOptions: { value: Relationship; label: string }[] = [
    { value: 'father', label: '父亲' }, { value: 'mother', label: '母亲' },
    { value: 'grandfather', label: '爷爷' }, { value: 'grandmother', label: '奶奶' },
    { value: 'maternal_grandfather', label: '外公' }, { value: 'maternal_grandmother', label: '外婆' },
    { value: 'spouse', label: '配偶' }, { value: 'child', label: '子女' },
    { value: 'sibling', label: '兄弟姐妹' }, { value: 'friend', label: '朋友' },
    { value: 'pet_cat', label: '宠物-猫' }, { value: 'pet_dog', label: '宠物-狗' },
    { value: 'pet_other', label: '宠物-其他' }, { value: 'other', label: '其他' },
  ]

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="cover_photo_path" value={coverPhotoPath || ''} />
      <input type="hidden" name="species" value={species} />

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Avatar/Cover Upload V2 Profile Creation Style */}
      <div className="flex flex-col items-center gap-4">
        {coverPhotoPreview ? (
            <div className="w-24 h-24 rounded-full border-2 border-stone-200 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={coverPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
               </div>
            </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center group cursor-pointer transition-colors ${
              isUploadingCover ? 'border-amber-300 bg-amber-50 animate-pulse' : 'border-stone-300 hover:bg-stone-50/50 hover:border-amber-700/30'
            }`}
          >
            <div className="flex flex-col items-center text-stone-500 group-hover:text-amber-700 transition-colors">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-[10px] uppercase tracking-widest font-medium">
                 {isUploadingCover ? '上传中...' : '上传照片'}
              </span>
            </div>
          </div>
        )}
        <p className="text-xs text-stone-500">建议使用清晰的正面照片，也可以稍后在编辑中更新</p>
        
        {mode === 'edit' && coverPhotoPath && (
           <button type="button" onClick={handleRemoveCoverPhoto} className="text-xs text-red-500 hover:underline">
             移除自定义照片
           </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
      </div>

      {uploadError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">
          {uploadError}
        </div>
      )}

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 block px-1">
            姓名 / 昵称 <span className="text-amber-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="如何称呼 TA"
            defaultValue={profile?.name || ''}
            required
            maxLength={100}
            disabled={isPending}
            className="w-full bg-stone-100 border-none rounded-lg py-3 px-4 focus:ring-0 focus:bg-white border-b-2 border-transparent focus:border-amber-700 transition-all text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="relationship" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 block px-1">
            TA 与我的关系 <span className="text-amber-600">*</span>
          </label>
          <select
            id="relationship"
            name="relationship"
            value={selectedRelationship}
            onChange={handleRelationshipChange}
            disabled={isPending}
            className="w-full bg-stone-100 border-none rounded-lg py-3 px-4 focus:ring-0 focus:bg-white border-b-2 border-transparent focus:border-amber-700 transition-all text-sm outline-none appearance-none cursor-pointer"
          >
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 relative">
          <label htmlFor="birth_date" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 block px-1">
            出生日期
          </label>
          <div className="relative">
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={profile?.birth_date || ''}
              disabled={isPending}
              className="w-full bg-stone-100 border-none rounded-lg py-3 px-4 focus:ring-0 focus:bg-white border-b-2 border-transparent focus:border-amber-700 transition-all text-sm outline-none cursor-pointer [color-scheme:light]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="death_date" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 block px-1">
            离世日期
          </label>
          <div className="relative">
            <input
              id="death_date"
              name="death_date"
              type="date"
              defaultValue={profile?.death_date || ''}
              disabled={isPending}
              className="w-full bg-stone-100 border-none rounded-lg py-3 px-4 focus:ring-0 focus:bg-white border-b-2 border-transparent focus:border-amber-700 transition-all text-sm outline-none cursor-pointer [color-scheme:light]"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 block px-1">
          一句话描述
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="那些深刻的印记，可以用一句话概括..."
          defaultValue={profile?.description || ''}
          disabled={isPending}
          maxLength={500}
          rows={2}
          className="w-full bg-stone-100 border-none rounded-lg py-3 px-4 focus:ring-0 focus:bg-white border-b-2 border-transparent focus:border-amber-700 transition-all text-sm outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-amber-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-amber-800/20 hover:bg-amber-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {isPending ? '正在构建...' : mode === 'create' ? '创建记忆空间' : '保存更新'}
        </button>
        {mode === 'edit' && (
           <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="w-full sm:w-1/3 bg-stone-100 text-stone-600 font-bold py-4 rounded-lg hover:bg-stone-200 transition-all flex items-center justify-center"
           >
             取消
           </button>
        )}
      </div>
    </form>
  )
}
