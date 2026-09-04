"use client";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleSavePostAction, toggleFeaturePostAction, deletePostAction, getSavedPostsAction } from "@/app/actions";
import { type PostWithUser } from "@/lib/db/schema";

const PostMenuAction = ({ post }: { post: PostWithUser }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isClerkReady = isUserLoaded && isAuthLoaded;

  const {
    isPending,
    error,
    data: savedPosts,
  } = useQuery({
    queryKey: ["savedPosts", user?.id],
    queryFn: async () => {
      return await getSavedPostsAction();
    },
    enabled: isClerkReady && !!user,
    staleTime: Infinity,
  });

  const isAdmin = user?.publicMetadata?.role === "admin" || false;
  const isSaved = Array.isArray(savedPosts) && savedPosts.includes(post._id);

  const saveMutation = useMutation({
    mutationFn: async () => await toggleSavePostAction(post._id),
    onSuccess: (isSavedNow) => {
      queryClient.invalidateQueries({ queryKey: ["savedPosts", user?.id] });
      toast.success(isSavedNow ? "Ajouté aux favoris !" : "Retiré des favoris !");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const featureMutation = useMutation({
    mutationFn: async () => await toggleFeaturePostAction(post._id),
    onSuccess: () => {
      toast.success("Statut \"en avant\" mis à jour !");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await deletePostAction(post._id),
    onSuccess: () => {
      toast.success("Post supprimé !");
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleSave = () => {
    if (!user) return router.push("/sign-in");
    saveMutation.mutate();
  };

  const handleFeature = () => {
     featureMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Supprimer ce post definitivement ?")) {
       deleteMutation.mutate();
    }
  };

  if (!isClerkReady) {
    return (
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        <div className="h-20 bg-zinc-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</h3>

      <div className="flex flex-col gap-1.5">
        {isPending ? (
          <div className="flex items-center gap-2 py-2 text-xs text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></span>
            <span>Chargement des actions...</span>
          </div>
        ) : error ? (
          <div className="py-2 text-xs text-red-500">Erreur de chargement</div>
        ) : (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-900"
            onClick={handleSave}
          >
            <Image
              src={isSaved ? "/bookmark-saved.svg" : "/bookmark-unsaved.svg"}
              alt={isSaved ? "Saved" : "Not saved"}
              width={18}
              height={18}
            />
            <span>{isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-zinc-900"
            onClick={handleFeature}
          >
            <Image
              src={post.isFeatured ? "/fullstar.svg" : "/star.svg"}
              alt="Feature"
              width={18}
              height={18}
            />
            <span>{post.isFeatured ? "Retirer de la une" : "Mettre à la une"}</span>
          </button>
        )}

        {user && (post.user?.username === user.username || isAdmin) && (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
            onClick={handleDelete}
          >
            <Image src="/trash.svg" alt="Delete" width={18} height={18} />
            <span>Supprimer le post</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PostMenuAction;

