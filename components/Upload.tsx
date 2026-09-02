"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getPresignedUploadUrlAction } from "@/app/actions";

export interface UploadResponse {
  fileId?: string;
  name?: string;
  url: string;
  filePath: string;
  [key: string]: unknown;
}

interface UploadProps {
  children: React.ReactNode;
  type: "image" | "video" | "audio" | string;
  folder?: string;
  setProgress: (progress: number) => void;
  setData: (data: UploadResponse) => void;
}

const Upload = ({ children, type, folder, setProgress, setData }: UploadProps) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB max size limit
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Le fichier est trop volumineux (max ${MAX_SIZE_MB} Mo)`);
      if (ref.current) ref.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      // 1. Get presigned upload URL from Server Action
      const { uploadUrl, publicUrl } = await getPresignedUploadUrlAction(
        file.name,
        file.type || "image/jpeg",
        folder
      );

      // 2. Direct upload to Cloudflare R2 via XMLHttpRequest with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          setData({
            url: publicUrl,
            filePath: publicUrl,
            name: file.name,
          });
          toast.success("Image uploadée avec succès sur Cloudflare R2 !");
        } else {
          toast.error(`Erreur d'upload vers Cloudflare R2 (${xhr.status})`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Erreur réseau lors du téléversement");
      };

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "image/jpeg");
      xhr.send(file);
    } catch (err: unknown) {
      setIsUploading(false);
      const message = err instanceof Error ? err.message : "Échec de l'upload";
      toast.error(message);
    } finally {
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={ref}
        onChange={handleFileChange}
        accept={`${type}/*`}
        className="hidden"
        disabled={isUploading}
      />
      <div
        className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => ref.current?.click()}
      >
        {children}
      </div>
    </>
  );
};

export default Upload;

