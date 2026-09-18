"use client";
import Link from "next/link";
import Comment from "./Comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
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
    <section className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Commentaires {data ? `(${data.length})` : ""}
        </h2>
      </div>

      {user ? (
        <form
          id="comment-form"
          onSubmit={handleSubmit}
          className="space-y-3 rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-4 sm:p-5 shadow-xs transition-all focus-within:border-zinc-400 dark:focus-within:border-indigo-500/60 focus-within:shadow-sm"
        >
          <textarea
            name="desc"
            aria-label="Votre commentaire"
            placeholder="Partagez votre avis ou posez une question..."
            rows={3}
            required
            className="w-full resize-none bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center justify-end pt-2 border-t border-zinc-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={newCommentMutation.isPending}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {newCommentMutation.isPending ? "Publication..." : "Publier mon commentaire"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-zinc-200/60 dark:border-slate-800 bg-zinc-50 dark:bg-[#121826]/60 p-4 text-center text-sm text-zinc-600 dark:text-slate-400">
          <Link href="/sign-in" className="font-semibold text-zinc-900 dark:text-indigo-400 underline hover:text-zinc-700 dark:hover:text-indigo-300">Connectez-vous</Link> pour participer à la discussion.
        </div>
      )}

      {isPending ? (
        <div className="space-y-3 pt-2">
          <div className="h-20 bg-zinc-100 dark:bg-[#121826] rounded-2xl animate-pulse"></div>
          <div className="h-20 bg-zinc-100 dark:bg-[#121826] rounded-2xl animate-pulse"></div>
        </div>
      ) : error ? (
        <div className="py-4 text-sm text-red-500 dark:text-red-400">Erreur lors du chargement des commentaires.</div>
      ) : (
        <div className="space-y-3 pt-2">
          {newCommentMutation.isPending && user && (
            <Comment
              comment={{
                _id: "temp-optimistic-id",
                desc: `${newCommentMutation.variables?.desc || ""}`,
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
          {data && data.length > 0 ? (
            data.map((comment: CommentWithUser) => (
              <Comment key={comment._id} comment={comment} postId={postId} />
            ))
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 italic">Soyez le premier à commenter ce post !</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Comments;
