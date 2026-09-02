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
    <div className="mb-8 rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        {comment.user.img ? (
          <Image
            src={comment.user.img}
            alt={comment.user.username}
            className="h-10 w-10 rounded object-cover"
            w={40}
          />
        ) : (
          <NextImage
            src="/profile.png"
            alt={comment.user.username}
            width={40}
            height={40}
            className="h-10 w-10 rounded object-cover"
          />
        )}
        <span className="font-medium">{comment.user.username}</span>
        <span className="text-sm text-gray-500">
          {format(comment.createdAt, "fr")}
        </span>
        {user &&
          (comment.user.username === user.username || role === "admin") && (
            <span
              className="cursor-pointer text-xs text-red-300 hover:text-red-500"
              onClick={() => deleteCommentMutation.mutate()}
            >
              Supprimer
              {deleteCommentMutation.isPending && <span> (En Cours...)</span>}
            </span>
          )}
      </div>
      <div className="mt-4">{comment.desc}</div>
    </div>
  );
};

export default Comment;
