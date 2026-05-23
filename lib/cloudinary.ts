import crypto from 'crypto'

/**
 * Uploads a file buffer directly to Cloudinary using secure, signature-based REST upload.
 * Utilizes Node.js built-in 'crypto' to avoid heavy external NPM dependencies.
 */
export async function uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')
  const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration credentials are missing in env.')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  
  // Cloudinary signature parameters must be sorted alphabetically
  const folder = 'investpro_kyc'
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  
  // Generate secure SHA-1 signature
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

  const formData = new FormData()
  const fileBlob = new Blob([new Uint8Array(fileBuffer)])
  
  formData.append('file', fileBlob, fileName)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Cloudinary upload failed')
  }

  const data = await response.json()
  return data.secure_url // Return secure HTTPS URL
}
