const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

type AllowedExtension = keyof typeof MIME_BY_EXTENSION;

const ALLOWED_MIME_TYPES = new Set<string>(Object.values(MIME_BY_EXTENSION));

// Some browsers send application/octet-stream for .docx, so fall back to the extension.
export function resolveDeliveryMimeType(fileName: string, mimeType: string): string | null {
  if (ALLOWED_MIME_TYPES.has(mimeType)) {
    return mimeType;
  }

  if (mimeType === 'application/octet-stream') {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension && extension in MIME_BY_EXTENSION) {
      return MIME_BY_EXTENSION[extension as AllowedExtension];
    }
  }

  return null;
}
