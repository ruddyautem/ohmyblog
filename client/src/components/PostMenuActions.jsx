import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const PostMenuAction = ({ post }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Wait for Clerk to be fully ready to avoid 401 errors on load
  const isClerkReady = isUserLoaded && isAuthLoaded;

  // Helper to compare IDs safely (handles Objects vs Strings)
  const isIdMatch = (p) => {
    const savedId = typeof p === "object" ? p._id?.toString() : p?.toString();
    const currentId = post._id?.toString();
    return savedId === currentId;
  };

  // 1. Fetch Saved Posts
  const {
    isPending,
    error,
    data: savedPosts,
  } = useQuery({
    queryKey: ["savedPosts", user?.id], // ✅ Unique per user
    queryFn: async () => {
      const token = await getToken();
      if (!token) return []; // Safety check

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/saved`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    // ✅ CRITICAL: Don't run until Clerk is ready AND user is logged in
    enabled: isClerkReady && !!user,
    staleTime: Infinity, // ✅ Don't auto-refetch, we update manually
  });

  const isAdmin = user?.publicMetadata?.role === "admin" || false;

  // ✅ Check if saved (using robust helper)
  const isSaved = Array.isArray(savedPosts) && savedPosts.some(isIdMatch);

  // 2. Save Mutation (Optimistic - Instant Feedback)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.patch(
        `${import.meta.env.VITE_API_URL}/users/save`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    // ✅ OPTIMISTIC UPDATE: Update UI immediately
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["savedPosts", user?.id] });

      // Snapshot the previous value
      const previousSaved = queryClient.getQueryData(["savedPosts", user?.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["savedPosts", user?.id], (old = []) => {
        if (!Array.isArray(old)) return [post._id];

        // Toggle logic locally
        return isSaved
          ? old.filter((p) => !isIdMatch(p)) // Remove if saved
          : [...old, post._id]; // Add if not saved
      });

      // Return context with the previous value
      return { previousSaved };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousSaved) {
        queryClient.setQueryData(
          ["savedPosts", user?.id],
          context.previousSaved,
        );
      }
      toast.error("Erreur lors de la sauvegarde");
    },
    onSuccess: () => {
      // Sync with server eventually to be safe
      queryClient.invalidateQueries({ queryKey: ["savedPosts", user?.id] });
      toast.success(isSaved ? "Ajouté aux favoris!" : "Retiré des favoris!");
    },
  });

  // 3. Feature Mutation
  const featureMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.patch(
        `${import.meta.env.VITE_API_URL}/posts/feature`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.slug] });
      toast.success(
        post.isFeatured ? "Retiré de la vedette" : "Mis en vedette",
      );
    },
    onError: () => toast.error("Échec de l'opération"),
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Post supprimé");
      navigate("/");
    },
    onError: () => toast.error("Échec de la suppression"),
  });

  // Handlers
  const handleSave = () => {
    if (!user) return navigate("/login");
    saveMutation.mutate();
  };

  const handleFeature = () => featureMutation.mutate();

  const handleDelete = () => {
    if (window.confirm("Supprimer ce post définitivement ?")) {
      deleteMutation.mutate();
    }
  };

  // ✅ LOADING STATE: Show simple text only during initial fetch
  // This prevents the UI from jumping around
  if (!isClerkReady) {
    return <div className="mt-8 text-sm text-gray-500">Chargement...</div>;
  }

  return (
    <div className="">
      <h1 className="mt-8 mb-4 text-sm font-medium">Actions</h1>

      {/* SAVE BUTTON */}
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
          <img
            src={isSaved ? "/bookmark-saved.svg" : "/bookmark-unsaved.svg"}
            alt={isSaved ? "Saved" : "Not saved"}
          />
          <span>{isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
        </div>
      )}

      {/* ADMIN FEATURE BUTTON */}
      {isAdmin && (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105 hover:text-red-500"
          onClick={handleFeature}
        >
          <img
            src={post.isFeatured ? "/fullstar.svg" : "/star.svg"}
            alt="Feature"
          />
          <span>Mettre en avant</span>
          {featureMutation.isPending && <span className="text-xs">...</span>}
        </div>
      )}

      {/* DELETE BUTTON */}
      {user && (post.user.username === user.username || isAdmin) && (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm text-red-500 transition-all duration-200 ease-in-out hover:scale-105 hover:text-red-500"
          onClick={handleDelete}
        >
          <img src="/trash.svg" alt="Delete" />
          <span>Supprimer ce post</span>
          {deleteMutation.isPending && <span className="text-xs">...</span>}
        </div>
      )}
    </div>
  );
};

export default PostMenuAction;
