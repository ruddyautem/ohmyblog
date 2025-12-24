import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const PostMenuAction = ({ post }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ CHANGE: Move this up before useQuery

  const {
    isPending,
    error,
    data: savedPosts,
  } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      // ✅ CHANGE: Only fetch if user is logged in
      if (!user) return [];

      const token = await getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/saved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data; // ✅ CHANGE: Return response.data directly, not the whole response
    },
    enabled: !!user, // ✅ CHANGE: Only run query if user exists
  });

  const isAdmin = user?.publicMetadata?.role === "admin" || false;
  // ✅ CHANGE: Fixed the isSaved check - removed the "|| false" which was breaking the logic
  const isSaved =
    Array.isArray(savedPosts) && savedPosts.some((p) => p === post._id);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.delete(`${import.meta.env.VITE_API_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Post Deleted Successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete post");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.patch(
        `${import.meta.env.VITE_API_URL}/users/save`,
        {
          postId: post._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      // ✅ CHANGE: Refetch the saved posts after mutation
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      // ✅ CHANGE: Fixed the toast message logic
      toast.success(isSaved ? "Retiré des favoris!" : "Ajouté aux favoris!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to save post");
    },
  });

  const featureMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.patch(
        `${import.meta.env.VITE_API_URL}/posts/feature`,
        {
          postId: post._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", post.slug] });
      // ✅ CHANGE: Add toast notification for feature toggle
      toast.success(
        post.isFeatured ? "Post retiré de la vedette" : "Post mis en vedette",
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to feature post");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleFeature = () => {
    featureMutation.mutate();
  };

  const handleSave = () => {
    if (!user) {
      return navigate("/login");
    }
    // ✅ CHANGE: Removed the isSaved argument - not needed
    saveMutation.mutate();
  };

  return (
    <div className="">
      <h1 className="mt-8 mb-4 text-sm font-medium">Actions</h1>
      {isPending ? (
        "Loading..."
      ) : error ? (
        "Saved posts fetching failed!"
      ) : (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105"
          onClick={handleSave}
        >
          <img
            src={`${isSaved ? "/bookmark-saved.svg" : "/bookmark-unsaved.svg"}`}
            alt={isSaved ? "Saved" : "Not saved"}
          />
          <span>{isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
          {/* ✅ CHANGE: Add loading state for save mutation */}
          {saveMutation.isPending && (
            <span className="text-xs">En cours...</span>
          )}
        </div>
      )}
      {isAdmin && (
        <div
          className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105"
          onClick={handleFeature}
        >
          <img
            src={`${post.isFeatured ? "/fullstar.svg" : "/star.svg"}`}
            alt={post.isFeatured ? "Featured" : "Not featured"}
          />
          <span>Mettre en avant</span>
          {featureMutation.isPending && (
            <span className="text-xs">En cours...</span>
          )}
        </div>
      )}
      {user && (post.user.username === user.username || isAdmin) && (
        <div className="flex cursor-pointer items-center gap-2 py-2 text-sm transition-all duration-200 ease-in-out hover:scale-105">
          <img src="/trash.svg" alt="Delete Post" />
          <span className="text-red-500" onClick={handleDelete}>
            Supprimer ce post
          </span>
          {deleteMutation.isPending && (
            <span className="text-xs">En cours...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostMenuAction;
