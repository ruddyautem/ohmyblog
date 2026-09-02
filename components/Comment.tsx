"use client";
import { format } from "timeago.js";
import "@/lib/timeago-fr";
import Image from "./Image";
import NextImage from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4.5 space-y-3 transition-colors hover:bg-zinc-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {comment.user.img ? (
            <Image
              src={comment.user.img}
              alt={comment.user.username}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200"
              w={36}
              h={36}
            />
          ) : (
            <NextImage
              src="/profile.png"
              alt={comment.user.username}
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200"
            />
          )}
          <div>
            <span className="text-sm font-bold text-zinc-900 capitalize block">{comment.user.username}</span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {format(comment.createdAt, "fr")}
            </span>
          </div>
        </div>

        {user && (comment.user.username === user.username || role === "admin") && (
          <button
            type="button"
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors p-1"
            onClick={() => deleteCommentMutation.mutate()}
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? "Suppression..." : "Supprimer"}
          </button>
        )}
      </div>

      <div className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap pl-1">
        {comment.desc}
      </div>
    </div>
  );
};

export default Comment;
