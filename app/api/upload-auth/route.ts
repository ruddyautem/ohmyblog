import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  urlEndpoint: process.env.NEXT_PUBLIC_IK_URL_ENDPOINT as string,
  publicKey: process.env.NEXT_PUBLIC_IK_PUBLIC_KEY as string,
  privateKey: process.env.IK_PRIVATE_KEY as string,
});

export async function GET() {
  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
