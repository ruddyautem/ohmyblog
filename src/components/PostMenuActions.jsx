import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const PostMenuAction = ({ post }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const {
    isPending,
    error,
    data: savedPosts,
  } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      const token = await getToken();
      return axios.get(`${import.meta.env.VITE_API_URL}/users/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });

  const isAdmin = user?.publicMetadata?.role === "admin" || false;
  const isSaved = savedPosts?.data?.some((p) => p === post._id || false);

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
      toast.error(error.response.data);
    },
  });

  const queryClient = useQueryClient();

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
    onSuccess: (_, wasSaved) => {
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      toast.success(wasSaved ? "Retiré des favoris!" : "Ajouté aux favoris!");
    },
    onError: (error) => {
      toast.error(error.response.data);
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
    },
    onError: (error) => {
      toast.error(error.response.data);
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
    saveMutation.mutate(isSaved);
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
          className="duration 200 flex cursor-pointer items-center gap-2 py-2 text-sm transition-all ease-in-out hover:scale-105"
          onClick={handleSave}
        >
          <img
            src={`${isSaved ? "bookmark-saved.svg" : "bookmark-unsaved.svg"}`}
            className=""
          />
          <span>{`${!isSaved ? "Ajouter aux favoris" : "Retirer des favoris"}`}</span>
        </div>
      )}
      {isAdmin && (
        <div
          className="duration 200 flex cursor-pointer items-center gap-2 py-2 text-sm transition-all ease-in-out hover:scale-105"
          onClick={handleFeature}
        >
          <img src={`${post.isFeatured ? "fullstar.svg" : "star.svg"}`} />
          <span>Mettre en avant</span>
          {featureMutation.isPending && (
            <span className="text-xs">En cours...</span>
          )}
        </div>
      )}
      {user && (post.user.username === user.username || isAdmin) && (
        <div className="duration 200 flex cursor-pointer items-center gap-2 py-2 text-sm transition-all ease-in-out hover:scale-105">
          <img src="trash.svg" alt="Delete Post" />
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
