import { Link, useParams } from "react-router";
import Image from "../components/Image";
import PostMenuAction from "../components/PostMenuActions";
import Search from "../components/Search";
import Comments from "../components/Comments";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "timeago.js";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  if (isPending) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!data) return "Post not found!";

  return (
    <div className="mt-12 flex flex-col gap-8">
      {/* details */}
      <div className="flex flex-col gap-8 md:flex-row">
        {data.img && (
          <div className="w-full md:w-2/5">
            <div className="max-h-72 overflow-hidden rounded">
              <Image
                src={data.img}
                w="600"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-8 md:ml-auto md:w-3/5">
          <h1 className="text-xl font-semibold md:text-3xl xl:text-4xl 2xl:text-5xl">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-black">
            <span>Publié par</span>
            <Link to="" className="font-bold capitalize">
              {data.user?.username || "Unknown"}
            </Link>
            <span>dans</span>
            <Link
              to={`/posts?cat=${data.category}`}
              className="font-bold capitalize"
            >
              {data.category}
            </Link>
            <span>{format(data.createdAt, "fr")}</span>
          </div>
          <p className="font-medium text-gray-500">{data.desc}</p>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-12 md:flex-row">
        {/* text */}
        <div
          className="prose max-w-none text-justify lg:text-lg"
          dangerouslySetInnerHTML={{ __html: data.content }}
        ></div>
        {/* menu */}
        <div className="sticky top-8 h-max md:px-4">
          <h1 className="mb-4 text-sm font-medium">Auteur</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              {data.user.img && (
                <Image
                  src={data.user.img}
                  className="h-12 w-12 rounded object-cover"
                  w="48"
                  h="48"
                />
              )}
              <Link to="/" className="font-semibold">
                {data.user.username}
              </Link>
            </div>
            <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet.</p>
            <div className="flex gap-2">
              <Link>
                <Image src="facebook.svg" />
              </Link>
              <Link>
                <Image src="instagram.svg" />
              </Link>
            </div>
          </div>
          <PostMenuAction post={data} />
          <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/posts" className="underline">
              Tous les posts
            </Link>
            <Link className="underline" to="/posts?cat=voyages">
              Voyages
            </Link>
            <Link className="underline" to="/posts?cat=cuisine">
              Cuisine
            </Link>
            <Link className="underline" to="/posts?cat=animaux">
              Animaux
            </Link>
            <Link className="underline" to="/posts?cat=astuces">
              Astuces
            </Link>
          </div>
          <h1 className="mt-8 mb-4 max-w-max text-sm font-medium">
            <Search />
          </h1>
        </div>
      </div>
      <Comments postId={data._id} />
    </div>
  );
};

export default SinglePostPage;
