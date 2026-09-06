// RFC 6266: quoted ASCII fallback plus filename* for the UTF-8 name.
export function attachmentDisposition(fileName: string): string {
  const asciiName = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
