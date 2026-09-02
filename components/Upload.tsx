"use client";
import { IKContext, IKUpload } from "imagekitio-react";
import { useRef } from "react";
import { toast } from "react-toastify";

const authenticator = async () => {
  try {
    const response = await fetch("/api/upload-auth");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
    throw new Error(`Authentication request failed`);
  }
};

export interface UploadResponse {
  fileId?: string;
  name?: string;
  url: string;
  filePath: string;
  [key: string]: unknown;
}

interface UploadProps {
  children: React.ReactNode;
  type: 'image' | 'video' | 'audio' | string;
  setProgress: (progress: number) => void;
  setData: (data: UploadResponse) => void;
}

const Upload = ({ children, type, setProgress, setData }: UploadProps) => {
  const ref = useRef<HTMLInputElement | null>(null);

  const onError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "Échec du téléchargement du fichier !";
    toast.error(message);
  };
  
  const onSuccess = (res: unknown) => {
    setData(res as UploadResponse);
  };
  
  const onUploadProgress = (progress: { loaded: number; total: number }) => {
    setProgress(Math.round((progress.loaded / progress.total) * 100));
  };

  return (
    <IKContext
      publicKey={process.env.NEXT_PUBLIC_IK_PUBLIC_KEY}
      urlEndpoint={process.env.NEXT_PUBLIC_IK_URL_ENDPOINT}
      authenticator={authenticator}
    >
      <IKUpload
        useUniqueFileName
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onUploadProgress}
        className="hidden"
        ref={ref}
        accept={`${type}/*`}
      />
      <div className="cursor-pointer" onClick={() => ref.current?.click()}>
        {children}
      </div>
    </IKContext>
  );
};

export default Upload;

