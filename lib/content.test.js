import { test, expect } from 'bun:test';
import { safeJsonLd, safeArticleHtml } from './content';
test('JSON-LD preserves author text without creating closing script markup',()=>{
 const data={title:'</script><img src=x onerror=alert(1)>'};
 const serialized=safeJsonLd(data);
 expect(serialized).not.toContain('<');expect(JSON.parse(serialized)).toEqual(data);
});
test('article sanitization preserves text and owned legacy videos and strips active markup',()=>{
 const base='https://assets.example.test';
 const html=safeArticleHtml('<p>Hello</p><script>alert(1)</script><img src=x onerror="alert(1)"><iframe src="https://evil.invalid"></iframe><iframe src="https://assets.example.test/old/video.mp4"></iframe>',base);
 expect(html).toContain('<p>Hello</p>');expect(html).toContain('<video');expect(html).toContain('controls');
 expect(html).not.toContain('onerror');expect(html).not.toContain('<script');expect(html).not.toContain('<iframe');expect(html).not.toContain('evil.invalid');
});
