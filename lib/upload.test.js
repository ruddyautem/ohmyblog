import { test, expect, mock } from 'bun:test';
import { S3Client } from '@aws-sdk/client-s3';
mock.module('@/lib/db',()=>({db:{}}));
mock.module('@clerk/nextjs/server',()=>({auth:async()=>({userId:'authorA'}),currentUser:async()=>null}));
mock.module('@/lib/r2',()=>({r2Client:new S3Client({region:'auto',endpoint:'https://r2.example.test',credentials:{accessKeyId:'fixture',secretAccessKey:'fixture'},requestHandler:{handle(){throw new Error('Network forbidden in tests');}}})}));
mock.module('next/cache',()=>({revalidatePath:()=>{}}));
const {getPresignedUploadUrlAction}=await import('../app/actions');
test('server rejects oversize, active SVG and mismatched upload declarations',async()=>{
 await expect(getPresignedUploadUrlAction('a.jpg','image/jpeg',undefined,5242881)).rejects.toThrow();
 await expect(getPresignedUploadUrlAction('a.svg','image/svg+xml',undefined,100)).rejects.toThrow();
 await expect(getPresignedUploadUrlAction('a.jpg','video/mp4',undefined,100)).rejects.toThrow();
});
test('signed upload binds content length and MIME to an owner-scoped immutable key',async()=>{
 const result=await getPresignedUploadUrlAction('photo.jpg','image/jpeg',undefined,1024);
 const url=new URL(result.uploadUrl);
 expect(result.key).toStartWith('users/authorA/');
 const headers=url.searchParams.get('X-Amz-SignedHeaders');
 expect(headers).toContain('content-length');expect(headers).toContain('content-type');
 expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
 const video=await getPresignedUploadUrlAction('clip.mp4','video/mp4',undefined,1024);expect(video.key).toEndWith('.mp4');
});
