import NextImage from "next/image";

export interface ImageProps {
  src: string;
  className?: string;
  w?: number | string;
  h?: number | string;
  alt?: string;
  description?: string;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

const Image = ({
  src,
  className,
  w,
  h,
  alt,
  description,
  priority = false,
  unoptimized,
  sizes,
}: ImageProps) => {
  if (!src) return null;

  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const isSvg =
    src.toLowerCase().endsWith(".svg") ||
    src.includes(".svg?") ||
    src.startsWith("data:image/svg");

  const isLocalStatic =
    src === "/logo.png" ||
    src === "/profile.png" ||
    src === "/favicon.ico" ||
    isSvg ||
    src.startsWith("/icons/");

  if (isLocalStatic) {
    return (
      <NextImage
        src={src}
        alt={alt || description || "Image"}
        width={w ? Number(w) : 100}
        height={h ? Number(h) : 100}
        className={className}
        unoptimized={unoptimized ?? isSvg}
      />
    );
  }

  // Cloudflare R2 Storage URL resolution
  let imageUrl = src;
  if (!isExternal) {
    const cleanPath = src.startsWith("/") ? src.slice(1) : src;
    const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
    imageUrl = `${r2Base}/${cleanPath}`;
  }

  const width = w ? Number(w) : 800;
  const height = h ? Number(h) : 600;

  return (
    <NextImage
      src={imageUrl}
      alt={alt || description || "Image"}
      width={width}
      height={height}
      priority={priority}
      className={className}
      unoptimized={unoptimized ?? isSvg}
      sizes={sizes}
    />
  );
};

export default Image;
