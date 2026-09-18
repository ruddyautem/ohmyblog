"use client";
import { formatTimeAgo } from "@/lib/timeago-fr";
import Image from "./Image";
import NextImage from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCommentAction } from "@/app/actions";
import { type CommentWithUser } from "@/lib/db/schema";

const Comment = ({ comment, postId }: { comment: CommentWithUser; postId: string }) => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: () => deleteCommentAction(comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Commentaire supprimé !");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-slate-800/80 bg-zinc-50/70 dark:bg-[#121826]/70 p-4.5 space-y-3 transition-colors hover:bg-zinc-50 dark:hover:bg-[#121826]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {comment.user.img ? (
            <Image
              src={comment.user.img}
              alt={comment.user.username}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
              w={36}
              h={36}
            />
          ) : (
            <NextImage
              src="/profile.png"
              alt={comment.user.username}
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
            />
          )}
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white capitalize block">{comment.user.username}</span>
            <span suppressHydrationWarning className="text-[11px] text-zinc-400 dark:text-slate-500 font-medium">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
        </div>

        {user && (comment.user.username === user.username || role === "admin") && (
          <button
            type="button"
            className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 cursor-pointer"
            onClick={() => deleteCommentMutation.mutate()}
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? "Suppression..." : "Supprimer"}
          </button>
        )}
      </div>

      <div className="text-sm leading-relaxed text-zinc-700 dark:text-slate-300 whitespace-pre-wrap pl-1">
        {comment.desc}
      </div>
    </div>
  );
};

export default Comment;
