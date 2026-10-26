import { test, expect } from "bun:test";
import { ownedAssetKey } from "./assets";
test("only the authenticated owner's namespace can be deleted", () => {
  const base = "https://assets.example.test/bucket";
  expect(ownedAssetKey(base+"/users/A/uploads/photo.jpg", "A", base)).toBe("users/A/uploads/photo.jpg");
  for (const url of [base+"/users/B/uploads/photo.jpg",base+"/legacy.jpg",base+"/users/AA/file.jpg","https://evil.invalid/bucket/users/A/file.jpg",base+"/users/A/%2e%2e/B/file.jpg",base+"/users/A/%2e%2e%2fB/file.jpg"]) expect(ownedAssetKey(url,"A",base)).toBeNull();
});
