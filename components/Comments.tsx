"use client";
import Comment from "./Comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { addCommentAction, getCommentsAction } from "@/app/actions";
import { type CommentWithUser } from "@/lib/db/schema";

const Comments = ({ postId }: { postId: string }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const newCommentMutation = useMutation({
    mutationFn: async (newComment: { desc: string }) => {
      return await addCommentAction(postId, newComment.desc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Commentaire ajouté !");
      const form = document.getElementById('comment-form') as HTMLFormElement;
      if (form) form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur!");
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsAction(postId),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      desc: formData.get("desc") as string,
    };

    newCommentMutation.mutate(data);
  };

  return (
    <div className="mb-12 flex flex-col gap-8 lg:w-3/5">
      <h1 className="text-xl text-gray-500 underline">Commentaires</h1>
      {user ? (
        <form
          id="comment-form"
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
      ) : (
        <p className="text-sm text-gray-500">Connectez-vous pour commenter</p>
      )}
      {isPending ? (
        "Chargement..."
      ) : error ? (
        "Erreur lors du chargement des Commentaires!"
      ) : (
        <>
          {newCommentMutation.isPending && user && (
            <Comment
              comment={{
                _id: "temp-optimistic-id",
                desc: `${newCommentMutation.variables?.desc || ""} (En cours...)`,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: user.id,
                postId,
                user: {
                  img: user.imageUrl || null,
                  username: user.username || "Anonymous",
                },
              }}
              postId={postId}
            />
          )}
          {data?.map((comment: CommentWithUser) => (
            <Comment key={comment._id} comment={comment} postId={postId} />
          ))}
        </>
      )}
    </div>
  );
};

export default Comments;
