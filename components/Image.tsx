"use client";
import { IKImage } from "imagekitio-react";

export interface ImageProps {
  src: string;
  className?: string;
  w?: number | string;
  h?: number | string;
  alt?: string;
  description?: string;
}

const Image = ({ src, className, w, h, alt, description }: ImageProps) => {
  const isExternal = src?.startsWith("http");

  return (
    <IKImage
      urlEndpoint={process.env.NEXT_PUBLIC_IK_URL_ENDPOINT}
      {...(isExternal ? { src } : { path: src })}
      className={className}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      alt={alt || description || "Image"}
      width={w ? String(w) : undefined}
      height={h ? String(h) : undefined}
      transformation={[{ width: w ? String(w) : undefined, height: h ? String(h) : undefined }]}
    />
  );
};

export default Image;
