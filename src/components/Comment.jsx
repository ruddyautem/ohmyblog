import { format } from "timeago.js";
import Image from "./Image";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

const Comment = ({ comment, postId }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const role = user?.publicMetadata?.role;

  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${comment._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Commentaire supprimé!");
    },
    onError: (error) => {
      toast.error(error.response.data);
    },
  });

  return (
    <div className="mb-8 rounded border-1 border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        {comment.user.img ? (
          <Image
            src={comment.user.img}
            className="h-10 w-10 rounded object-cover"
            w="40"
          />
        ) : (
          <img 
            src="/profile.png" 
            alt={comment.user.username}
            className="h-10 w-10 rounded object-cover" 
          />
        )}
        <span className="font-medium">{comment.user.username}</span>
        <span className="text-sm text-gray-500">
          {format(comment.createdAt, 'fr')}
        </span>
        {user &&
          (comment.user.username === user.username || role === "admin") && (
            <span
              className="cursor-pointer text-xs text-red-300 hover:text-red-500"
              onClick={() => deleteCommentMutation.mutate()}
            >
              Supprimer
              {deleteCommentMutation.isPending && <span>(En Cours...)</span>}
            </span>
          )}
      </div>
      <div className="mt-4">{comment.desc}</div>
    </div>
  );
};

export default Comment;