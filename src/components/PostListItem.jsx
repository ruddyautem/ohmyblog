import { Link, useNavigate } from "react-router";
import Image from "./Image";
import { format } from "timeago.js";

const PostListItem = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-12 flex flex-col gap-8 xl:flex-row">
      {/* image */}
      {post.img && (
        <div
          className="cursor-pointer self-center xl:block xl:w-1/3"
          onClick={() => navigate(`/${post.slug}`)}
        >
          <div className="max-h-72 overflow-hidden rounded">
            <Image
              src={post.img}
              className="w-full h-full object-cover"
              w="735"
            />
          </div>
        </div>
      )}
      {/* details */}
      <div className="flex flex-col items-center justify-center gap-4 lg:justify-start xl:w-2/3 xl:items-start">
        <Link
          to={`/${post.slug}`}
          className="text-center text-4xl font-semibold xl:text-start"
        >
          {post.title}
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Publié par</span>
          <Link
            to={`/posts.author=${post.user.username}`}
            className="font-semibold text-black capitalize"
          >
            {post.user.username}
          </Link>
          <span>dans</span>
          <Link className="font-semibold text-black capitalize">
            {post.category}
          </Link>
          <span>{format(post.createdAt, "fr")}</span>
        </div>

        <p>{post.desc}</p>
        <div className="">
          <Link
            to={`/${post.slug}`}
            className="flex h-10 w-28 items-center justify-center rounded bg-black text-center text-xs text-white hover:bg-gray-700"
          >
            Lire le post
          </Link>
          <p className="h-10 w-28 items-center justify-center pt-1 text-center text-xs text-black">
            Consulté {post.visit} fois
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostListItem;
