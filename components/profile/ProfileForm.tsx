'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Relationship, Species, Memory } from '@/lib/types'
import { isPetRelationship } from '@/lib/types'
import { createProfile, updateProfile, type ProfileState } from '@/lib/actions/profile'
import { uploadMemoryFile } from '@/lib/actions/upload'
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

  // Cover photo state
  const [coverPhotoPath, setCoverPhotoPath] = useState<string | null>(profile?.cover_photo_path || null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)
  const [existingPhotos, setExistingPhotos] = useState<Memory[]>([])
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const action = mode === 'create' ? createProfile : updateProfile.bind(null, profile?.id || '')
  const [state, formAction, isPending] = useActionState(action, initialState)

  // Build cover photo preview URL
  const getCoverPhotoUrl = (path: string | null): string | null => {
    if (!path) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
  }

  // Get avatar URL as fallback
  const getAvatarUrl = (): string | null => {
    if (!profile?.avatar_path) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profile.avatar_path}`
  }

  // Fetch existing photos when in edit mode
  useEffect(() => {
    if (mode === 'edit' && profile?.id) {
      fetch(`/api/photos?profileId=${profile.id}`)
        .then(res => res.ok ? res.json() : { photos: [] })
        .then(data => setExistingPhotos(data.photos || []))
        .catch(() => setExistingPhotos([]))
    }
  }, [mode, profile?.id])

  // Set initial cover photo preview
  useEffect(() => {
    if (coverPhotoPath) {
      setCoverPhotoPreview(getCoverPhotoUrl(coverPhotoPath))
    } else if (profile?.avatar_path) {
      // Fallback to avatar if no cover photo
      setCoverPhotoPreview(getAvatarUrl())
    } else {
      setCoverPhotoPreview(null)
    }
  }, [coverPhotoPath, profile?.avatar_path])

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

  // Handle cover photo file selection
  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    setUploadError(null)
    setIsUploadingCover(true)

    try {
      // Generate a unique filename for the cover photo
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `cover_${Date.now()}.${fileExt}`

      // Upload to avatars bucket (reuse avatar bucket for profile images)
      const result = await uploadMemoryFile('avatars', profile.id, 'cover', fileName, file)

      if (result.success && result.filePath) {
        setCoverPhotoPath(result.filePath)
      } else {
        setUploadError(result.error || '上传封面照片失败')
      }
    } catch (err) {
      setUploadError('上传封面照片失败')
    } finally {
      setIsUploadingCover(false)
    }
  }

  // Handle selecting an existing photo as cover
  const handleSelectExistingPhoto = (photo: Memory) => {
    if (photo.file_path) {
      setCoverPhotoPath(photo.file_path)
    }
  }

  // Handle removing cover photo
  const handleRemoveCoverPhoto = () => {
    setCoverPhotoPath(null)
    setCoverPhotoPreview(getAvatarUrl()) // Fall back to avatar
  }

  // Redirect on success
  if (state.success && state.profileId) {
    router.push(`/profile/${state.profileId}`)
    router.refresh()
  }

  if (state.success && mode === 'create') {
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
      {/* Hidden field for cover_photo_path */}
      <input type="hidden" name="cover_photo_path" value={coverPhotoPath || ''} />

      {/* Error Message */}
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Cover Photo Preview Banner */}
      <div className="relative h-40 overflow-hidden rounded-xl bg-stone-100">
        {coverPhotoPreview ? (
          <>
            <img
              src={coverPhotoPreview}
              alt="封面照片预览"
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm">暂无封面照片</p>
            </div>
          </div>
        )}

        {/* Cover Photo Controls */}
        {mode === 'edit' && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCover}
              className="bg-white/90 hover:bg-white border-stone-200 text-stone-700 rounded-lg text-xs"
            >
              {isUploadingCover ? '上传中...' : '上传新封面'}
            </Button>
            {coverPhotoPath && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveCoverPhoto}
                disabled={isUploadingCover}
                className="bg-white/90 hover:bg-white border-stone-200 text-stone-700 rounded-lg text-xs"
              >
                移除
              </Button>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverPhotoChange}
          className="hidden"
        />
      </div>

      {/* Upload error message */}
      {uploadError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* Existing Photos Selection */}
      {mode === 'edit' && existingPhotos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-stone-700">或选择已有照片作为封面</Label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {existingPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleSelectExistingPhoto(photo)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  coverPhotoPath === photo.file_path
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {photo.thumbnail_path || photo.file_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.thumbnail_path || photo.file_path}`}
                    alt={photo.file_name || '照片'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
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
