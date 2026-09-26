import { useEffect, useState } from 'react';

/** An object URL for a stored photo, revoked when the photo changes or the view goes away. */
export function usePhotoUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) return undefined;
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}
