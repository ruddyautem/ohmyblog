import axios from "axios";
import Comment from "./Comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const Comments = ({ postId }) => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchComments = async (postId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/comments/${postId}`,
    );
    return res.data;
  };

  const queryClient = useQueryClient();

  const newCommentMutation = useMutation({
    mutationFn: async (newComment) => {
      const token = await getToken();
      return axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${postId}`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      toast.error(error.response.data);
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      desc: formData.get("desc"),
    };

    newCommentMutation.mutate(data);
  };

  return (
    <div className="mb-12 flex flex-col gap-8 lg:w-3/5">
      <h1 className="text-xl text-gray-500 underline">Commentaires</h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center justify-between gap-8"
      >
        <textarea
          name="desc"
          placeholder="Ajouter un commentaire..."
          id=""
          className="w-full rounded bg-gray-200 p-4 text-black outline-none focus:ring-2 focus:ring-black"
        />
        <button className="cursor-pointer bg-black px-4 py-2 text-white transition-all duration-200 ease-in-out hover:scale-105">
          Ajouter
        </button>
      </form>
      {isPending ? (
        "Chargement..."
      ) : error ? (
        "Erreur lors du chargement des Commentaires!"
      ) : (
        <>
          {newCommentMutation.isPending && (
            <Comment
              comment={{
                desc: `${newCommentMutation.variables.desc} (En cours...)`,
                createdAt: new Date(),
                user: {
                  img: user.imageUrl,
                  username: user.username,
                },
              }}
            />
          )}
          {data.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} />
          ))}
        </>
      )}
    </div>
  );
};

export default Comments;
