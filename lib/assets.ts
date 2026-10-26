export const uploadPrefix = (userId: string) => 'users/' + encodeURIComponent(userId) + '/';
export function ownedAssetKey(value: string, userId: string, publicBase: string): string | null {
  try {
    const base = new URL(publicBase.replace(/\/+$/, '') + '/');
    const url = new URL(value);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
    const key = decodeURIComponent(url.pathname.slice(base.pathname.length));
    return key.startsWith(uploadPrefix(userId)) && !key.split('/').some((part) => part === '..' || part === '.') ? key : null;
  } catch { return null; }
}
