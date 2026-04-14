import exifr from 'exifr'

/**
 * Extract the拍摄日期 from EXIF data of a file.
 * Supports JPEG, PNG, HEIC formats.
 * Silently returns null if no EXIF data is available.
 */
export async function extractExifDate(file: File): Promise<Date | null> {
  try {
    const exif = await exifr.parse(file, { pick: ['DateTimeOriginal'] })
    if (!exif || !exif.DateTimeOriginal) {
      return null
    }
    return exif.DateTimeOriginal as Date
  } catch {
    // Silently handle files without EXIF
    return null
  }
}

/**
 * Extract full EXIF data from a file.
 * Supports JPEG, PNG, HEIC formats.
 * Returns an empty object if no EXIF data is available.
 */
export async function extractExifData(file: File): Promise<Record<string, unknown>> {
  try {
    const exif = await exifr.parse(file)
    if (!exif) {
      return {}
    }
    return exif as Record<string, unknown>
  } catch {
    // Silently handle files without EXIF
    return {}
  }
}
