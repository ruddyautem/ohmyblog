import NextImage from "next/image";

export interface ImageProps {
  src: string;
  className?: string;
  w?: number | string;
  h?: number | string;
  alt?: string;
  description?: string;
  priority?: boolean;
}

const Image = ({ src, className, w, h, alt, description, priority = false }: ImageProps) => {
  if (!src) return null;

  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const endpoint = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT || "https://ik.imagekit.io/panderawan";

  // Build clean direct image URL
  const cleanPath = src.startsWith("/") ? src.slice(1) : src;
  const imageUrl = isExternal ? src : `${endpoint}/${cleanPath}`;

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
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};

export default Image;
