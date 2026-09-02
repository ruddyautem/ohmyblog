import { IKImage } from "imagekitio-react";

const Image = ({ src, className, w, h, description }) => {
  const isExternal = src?.startsWith("http");

  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      {...(isExternal ? { src } : { path: src })}
      className={className}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      alt={description}
      width={w}
      height={h}
      transformation={[{ width: w, height: h }]}
    />
  );
};

export default Image;
