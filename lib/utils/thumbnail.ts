/**
 * Generate a thumbnail blob from a file.
 * - Photos: resize using canvas
 * - Videos: capture first frame
 * - Audio/Documents: return null (use default icons)
 *
 * @param file - The file to generate thumbnail from
 * @param maxSize - Maximum dimension (width or height) in pixels, default 400
 * @returns Blob or null if thumbnail cannot be generated
 */
export async function generateThumbnail(
  file: File,
  maxSize: number = 400
): Promise<Blob | null> {
  const mimeType = file.type

  if (mimeType.startsWith('image/')) {
    return generateImageThumbnail(file, maxSize)
  }

  if (mimeType.startsWith('video/')) {
    return generateVideoThumbnail(file, maxSize)
  }

  // Audio and documents return null (use default icons)
  return null
}

async function generateImageThumbnail(file: File, maxSize: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions maintaining aspect ratio
      const { width, height } = calculateDimensions(img.width, img.height, maxSize)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

async function generateVideoThumbnail(file: File, maxSize: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.playsInline = true
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      // Seek to 0 to capture first frame
      video.currentTime = 0
    }

    video.onseeked = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions maintaining aspect ratio
      const { width, height } = calculateDimensions(video.videoWidth, video.videoHeight, maxSize)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(video, 0, 0, width, height)

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.8
      )
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    video.onloadeddata = () => {
      video.currentTime = 0
    }

    video.src = url
    video.load()
  })
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio),
    }
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize,
    }
  }
}
