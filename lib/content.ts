import DOMPurify from 'isomorphic-dompurify';

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function safeArticleHtml(content: string, publicBase?: string) {
  // Preserve previously uploaded video embeds by converting only our own media
  // URLs to native video. Arbitrary iframe providers remain disallowed.
  const migrated = content.replace(/<iframe\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>[\s\S]*?<\/iframe\s*>/gi, (_match, _quote, source: string) => {
    try {
      if (!publicBase) return '';
      const url = new URL(source), base = new URL(publicBase.replace(/\/+$/, '') + '/');
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || !/\.(mp4|webm)$/i.test(url.pathname)) return '';
      const src = url.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<video controls preload="metadata" class="w-full rounded-xl my-4" src="${src}"></video>`;
    } catch { return ''; }
  });
  return DOMPurify.sanitize(migrated, { ADD_TAGS: ['video','source'], FORBID_TAGS: ['iframe'], ADD_ATTR: ['controls','preload','class'] });
}
