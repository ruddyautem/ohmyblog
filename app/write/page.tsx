"use client";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Upload from "@/components/Upload";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostAction } from "@/app/actions";

import Underline from '@tiptap/extension-underline';
import TiptapImage from '@tiptap/extension-image';
import NextImage from "next/image";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-gray-100 rounded border border-gray-300">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded font-bold ${editor.isActive('bold') ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded italic ${editor.isActive('italic') ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`px-3 py-1 rounded underline ${editor.isActive('underline') ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        U
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        • List
      </button>
    </div>
  );
};

const postSchema = z.object({
  title: z.string().min(3, "Titre trop court"),
  desc: z.string().optional(),
  category: z.string(),
});
type PostSchemaType = z.infer<typeof postSchema>;

const Write = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [cover, setCover] = useState<{ url: string; filePath: string } | null>(null);
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage.configure({ inline: true, allowBase64: true }),
    ],
    content: '<p>Commencez à écrire ici...</p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] p-4 bg-gray-50 border border-gray-300 rounded text-black [&_img]:max-w-full [&_img]:my-2 [&_img]:rounded [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:ml-4',
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostSchemaType>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      desc: "",
      category: "general",
    },
  });

  const handleImageUpload = (data: { url: string; filePath: string }) => {
    console.log('Image upload response:', data);
    if (!data.url) {
      toast.error("URL de l'image manquante");
      return;
    }
    editor?.chain().focus().setImage({ src: data.url }).run();
    toast.success("Image ajoutée !");
  };

  const handleVideoUpload = (data: { url: string }) => {
    console.log('Video upload response:', data);
    editor?.chain().focus().insertContent(`<p><iframe src="${data.url}" frameborder="0" allowfullscreen></iframe></p>`).run();
    toast.success("Vidéo ajoutée !");
  };

  const mutation = useMutation({
    mutationFn: async (newPost: PostSchemaType & { img: string; content: string }) => {
      return await createPostAction(newPost);
    },
    onSuccess: (res) => {
      toast.success("Post créé avec succès !");
      reset();
      editor?.commands.setContent('');
      setCover(null);
      if (res?.slug) router.push(`/${res.slug}`);
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    }
  });

  if (!isLoaded) return <div className="text-center">Chargement...</div>;
  if (isLoaded && !isSignedIn) return <div className="">Vous devez vous authentifier!</div>;

  const onSubmit = async (data: PostSchemaType) => {
    const postData = {
      ...data,
      img: cover?.filePath || "",
      content: editor?.getHTML() || "",
    };
    mutation.mutate(postData);
  };

  return (
    <div className="flex h-max flex-col gap-6 py-8">
      <h1 className="text-xl font-light">Créer un nouveau post</h1>
      <form className="mb-6 flex flex-1 flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4">
          <Upload
            type="image"
            setProgress={setProgress}
            setData={(data) => {
              setCover(data);
              toast.success("Photo de couverture ajoutée!");
            }}
          >
            <button
              type="button"
              className="w-36 cursor-pointer rounded bg-black p-2 text-white"
            >
              Ajouter image de couverture
            </button>
          </Upload>
          {cover?.url && (
            <NextImage
              src={cover.url}
              alt="Cover Preview"
              width={96}
              height={64}
              className="h-16 w-24 rounded object-cover shadow"
            />
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Titre de mon histoire"
            className="w-full rounded bg-gray-200 p-2 text-4xl font-semibold text-black focus:outline-2"
            {...register("title")}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm">Choisissez une catégorie:</label>
          <select {...register("category")} className="rounded bg-gray-200 p-2">
            <option value="general">General</option>
            <option value="voyages">Voyages</option>
            <option value="cuisine">Cuisine</option>
            <option value="animaux">Animaux</option>
            <option value="astuces">Astuces</option>
          </select>
        </div>

        <textarea
          placeholder="Courte description"
          className="w-full rounded bg-gray-200 p-4 text-black outline-none focus:ring-2 focus:ring-black"
          {...register("desc")}
        />

        <div className="flex flex-col flex-1 w-full mt-4">
          <MenuBar editor={editor} />
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="flex flex-row md:flex-col gap-2">
              <Upload type="image" setProgress={setProgress} setData={handleImageUpload}>
                <span className="cursor-pointer font-bold text-gray-500 hover:text-black">⊕ Image</span>
              </Upload>
              <Upload type="video" setProgress={setProgress} setData={handleVideoUpload}>
                <span className="cursor-pointer font-bold text-gray-500 hover:text-black">⊕ Vidéo</span>
              </Upload>
            </div>
            <div className="flex-1 w-full">
              <EditorContent editor={editor} className="w-full h-full min-h-[400px]" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || (0 < progress && progress < 100)}
          className="my-4 w-36 self-end cursor-pointer rounded bg-black p-3 text-white font-semibold disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-200"
        >
          {mutation.isPending ? "En Cours..." : "Publier"}
        </button>
      </form>
    </div>
  );
};

export default Write;
