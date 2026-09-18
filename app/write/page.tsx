"use client";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Upload from "@/components/Upload";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostAction } from "@/app/actions";

import Underline from '@tiptap/extension-underline';
import TiptapImage from '@tiptap/extension-image';
import NextImage from "next/image";
import Link from "next/link";

const MenuBar = ({
  editor,
  folder,
  setProgress,
  handleImageUpload,
  handleVideoUpload,
}: {
  editor: Editor | null;
  folder?: string;
  setProgress: (p: number) => void;
  handleImageUpload: (data: { url: string; filePath: string }) => void;
  handleVideoUpload: (data: { url: string }) => void;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-16 md:top-20 z-30 mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#121826]/95 p-1.5 sm:p-2 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
            editor.isActive('bold') ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
          title="Gras"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm italic transition-colors ${
            editor.isActive('italic') ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
          title="Italique"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm underline transition-colors ${
            editor.isActive('underline') ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
          title="Souligné"
        >
          U
        </button>
        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-slate-700"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            editor.isActive('bulletList') ? 'bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 text-white' : 'text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-[#182032]'
          }`}
        >
          • Liste
        </button>
      </div>

      <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-slate-700 pl-2">
        <Upload type="image" folder={folder} setProgress={setProgress} setData={handleImageUpload}>
          <span className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-[#182032] border border-transparent dark:border-slate-700/60 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-slate-300 transition-colors hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white">
            🖼️ Image
          </span>
        </Upload>
        <Upload type="video" folder={folder} setProgress={setProgress} setData={handleVideoUpload}>
          <span className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-[#182032] border border-transparent dark:border-slate-700/60 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-slate-300 transition-colors hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white">
            🎥 Vidéo
          </span>
        </Upload>
      </div>
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
    content: '<p>Rédigez votre récit ici...</p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[450px] p-6 text-zinc-800 dark:text-slate-100 leading-relaxed text-base sm:text-lg [&_img]:max-w-full [&_img]:my-6 [&_img]:rounded-2xl [&_img]:shadow-sm [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_p]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-900 dark:[&_blockquote]:border-indigo-500',
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<PostSchemaType>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      desc: "",
      category: "general",
    },
  });

  const currentTitle = useWatch({ control, name: "title" });

  const handleImageUpload = (data: { url: string; filePath: string }) => {
    if (!data.url) {
      toast.error("URL de l'image manquante");
      return;
    }
    editor?.chain().focus().setImage({ src: data.url }).run();
    toast.success("Image insérée !");
  };

  const handleVideoUpload = (data: { url: string }) => {
    editor?.chain().focus().insertContent(`<p><iframe src="${data.url}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-2xl my-4"></iframe></p>`).run();
    toast.success("Vidéo insérée !");
  };

  const mutation = useMutation({
    mutationFn: async (newPost: PostSchemaType & { img: string; content: string }) => {
      return await createPostAction(newPost);
    },
    onSuccess: (res) => {
      toast.success("Post publié avec succès !");
      reset();
      editor?.commands.setContent('');
      setCover(null);
      if (res?.slug) router.push(`/${res.slug}`);
    },
    onError: () => {
      toast.error("Erreur lors de la publication");
    }
  });

  if (!isLoaded) return <div className="py-20 text-center text-zinc-400 dark:text-slate-500">Chargement...</div>;
  if (isLoaded && !isSignedIn) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Connexion requise</h2>
        <p className="text-zinc-600 dark:text-slate-400">Vous devez être connecté pour rédiger et publier un post.</p>
        <Link href="/sign-in" className="inline-block rounded-full bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 transition-colors shadow-xs">
          Se connecter
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: PostSchemaType) => {
    const rawContent = editor?.getText().trim() || "";
    if (rawContent.length < 10) {
      toast.error("Veuillez rédiger au moins 10 caractères dans le corps de votre article avant de publier.");
      return;
    }

    const postData = {
      ...data,
      img: cover?.filePath || "",
      content: editor?.getHTML() || "",
    };
    mutation.mutate(postData);
  };

  return (
    <div className="mx-auto max-w-4xl py-2 sm:py-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-slate-800 pb-4 sm:pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Nouveau post</h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">Rédigez et partagez votre histoire</p>
          </div>
        </div>

        {/* Cover Image Uploader */}
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-zinc-300 dark:border-slate-700 bg-zinc-50/50 dark:bg-[#121826]/50 p-4 sm:p-6 transition-colors hover:border-zinc-400 dark:hover:border-indigo-500/50">
          {cover?.url ? (
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-[#182032]">
              <NextImage
                src={cover.url}
                alt="Couverture"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setCover(null)}
                className="absolute top-3 right-3 rounded-xl bg-zinc-900/80 dark:bg-[#121826]/90 border border-transparent dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-200 backdrop-blur-md hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                ✕ Supprimer la couverture
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Upload
                type="image"
                folder={currentTitle ? currentTitle.trim() : "brouillon"}
                setProgress={setProgress}
                setData={(data) => {
                  setCover(data);
                  toast.success("Photo de couverture ajoutée !");
                }}
              >
                <div className="flex flex-col items-center gap-2 cursor-pointer">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-[#182032] text-xl text-zinc-600 dark:text-slate-300 ring-1 ring-zinc-200 dark:ring-slate-700">
                    🖼️
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Ajouter une photo de couverture
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-slate-500">
                    JPEG, PNG ou WEBP pour illustrer votre post
                  </span>
                </div>
              </Upload>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 shadow-xs focus-within:border-zinc-900 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-indigo-500/30 transition-all">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500 mb-2">
            Titre du post
          </label>
          <input
            type="text"
            placeholder="Donnez un titre captivant à votre histoire..."
            className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-600 focus:outline-none"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-2 text-xs font-semibold text-red-500">{errors.title.message as string}</p>
          )}
        </div>

        {/* Category & Excerpt Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">Catégorie</label>
            <select
              {...register("category")}
              className="w-full rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#121826] px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-slate-200 focus:border-zinc-900 dark:focus:border-indigo-500 focus:outline-none"
            >
              <option value="general">Général</option>
              <option value="voyages">Voyages</option>
              <option value="cuisine">Cuisine</option>
              <option value="animaux">Animaux</option>
              <option value="astuces">Astuces</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">Description courte (Extrait)</label>
            <input
              type="text"
              placeholder="Un bref résumé de votre histoire..."
              className="w-full rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#121826] px-4 py-2.5 text-sm text-zinc-800 dark:text-slate-200 placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:border-zinc-900 dark:focus:border-indigo-500 focus:outline-none"
              {...register("desc")}
            />
          </div>
        </div>

        {/* Editor Body with Sticky MenuBar */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-3 sm:p-4 shadow-xs">
          <MenuBar
            editor={editor}
            folder={currentTitle ? currentTitle.trim() : "brouillon"}
            setProgress={setProgress}
            handleImageUpload={handleImageUpload}
            handleVideoUpload={handleVideoUpload}
          />
          <div className="min-h-72 sm:min-h-112.5">
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full justify-center">
            <button
              type="submit"
              disabled={mutation.isPending || (0 < progress && progress < 100)}
              className="inline-flex w-full sm:w-48 sm:ml-auto items-center justify-center rounded-xl bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 dark:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 cursor-pointer text-center"
            >
              {mutation.isPending ? "Publication..." : "Publier le post"}
            </button>
          </div>
      </form>
    </div>
  );
};

export default Write;
