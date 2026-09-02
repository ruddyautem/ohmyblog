"use client";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
    return <div className="mt-8 text-sm text-gray-500">Chargement...</div>;
  }

  return (
    <div className="">
      <h1 className="mt-8 mb-4 text-sm font-medium">Actions</h1>

      {isPending ? (
        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black"></span>
          <span>Chargement...</span>
        </div>
      ) : error ? (
        <div className="py-2 text-xs text-red-500">Erreur de chargement</div>
      ) : (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105 hover:text-red-500"
          onClick={handleSave}
        >
          <Image
            src={isSaved ? "/bookmark-saved.svg" : "/bookmark-unsaved.svg"}
            alt={isSaved ? "Saved" : "Not saved"}
            width={20}
            height={20}
          />
          <span>{isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
        </div>
      )}

      {isAdmin && (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105 hover:text-red-500"
          onClick={handleFeature}
        >
          <Image
            src={post.isFeatured ? "/fullstar.svg" : "/star.svg"}
            alt="Feature"
            width={20}
            height={20}
          />
          <span>Mettre en avant</span>
        </div>
      )}

      {user && (post.user?.username === user.username || isAdmin) && (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm text-red-500 transition-all duration-200 ease-in-out hover:scale-105 hover:text-red-500"
          onClick={handleDelete}
        >
          <Image src="/trash.svg" alt="Delete" width={20} height={20} />
          <span>Supprimer ce post</span>
        </div>
      )}
    </div>
  );
};

export default PostMenuAction;

