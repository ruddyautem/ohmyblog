import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Upload from "../components/Upload";

const Write = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [cover, setCover] = useState("null");
  const [progress, setProgress] = useState(0);
  const [value, setValue] = useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");

  useEffect(() => {
    img && setValue((prev) => prev + `<p><image src="${img.url}"/></p>`);
  }, [img]);

  useEffect(() => {
    video &&
      setValue(
        (prev) => prev + `<p><iframe class="ql-video" src="${video.url}"/></p>`,
      );
  }, [video]);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const token = await getToken();
      return axios.post(`${import.meta.env.VITE_API_URL}/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (res) => {
      toast.success("Post Created Successfully!");
      navigate(`/${res.data.slug}`);
    },
  });

  if (!isLoaded) {
    return <div className="text-center">Chargement...</div>;
  }

  if (isLoaded && !isSignedIn) {
    return <div className="">Vous devez vous authentifier!</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      img: cover.filePath || "",
      title: formData.get("title"),
      desc: formData.get("desc"),
      category: formData.get("category"),
      content: value,
    };
    console.log(data);
    mutation.mutate(data);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-6 md:h-[calc(100vh-80px)]">
      <h1 className="text-xl font-light">Créer un nouveau post</h1>
      <form className="mb-6 flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          <Upload
            type="image"
            setProgress={setProgress}
            setData={(data) => {
              setCover(data);
              toast.success("Photo de couverture ajoutée!");
            }}
          >
            <button
              type="button"
              className="w-36 cursor-pointer rounded bg-black p-2 text-white"
            >
              Ajouter image de couverture
            </button>
          </Upload>
          {cover?.url && (
            <img
              src={cover.url}
              alt="Cover Preview"
              className="h-16 w-24 rounded object-cover shadow"
            />
          )}
        </div>

        <input
          type="text"
          placeholder="Titre de mon histoire"
          className="rounded bg-gray-200 p-2 text-4xl font-semibold text-black focus:outline-2"
          name="title"
        />

        <div className="flex items-center gap-4">
          <label className="text-sm">Choisissez une catégorie:</label>
          <select name="category" className="rounded bg-gray-200 p-2">
            <option value="general">General</option>
            <option value="voyages">Voyages</option>
            <option value="cuisine">Cuisine</option>
            <option value="animaux">Animaux</option>
            <option value="astuces">Astuces</option>
          </select>
        </div>

        <textarea
          name="desc"
          id=""
          placeholder="Courte description"
          className="w-full rounded bg-gray-200 p-4 text-black outline-none focus:ring-2 focus:ring-black"
        />

        <div className="flex flex-1">
          <div className="mr-2 flex flex-col gap-2">
            <Upload type="image" setProgress={setProgress} setData={setImg}>
              🖼️
            </Upload>
            <Upload type="video" setProgress={setProgress} setData={setVideo}>
              ▶️
            </Upload>
          </div>
          <ReactQuill
            theme="snow"
            className="flex-1 rounded bg-gray-200 text-black"
            value={value}
            onChange={setValue}
            readOnly={0 < progress && progress < 100}
          />
        </div>

        <button
          disabled={mutation.isPending || (0 < progress && progress < 100)}
          className="my-4 w-36 cursor-pointer rounded bg-black p-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-200"
        >
          {mutation.isPending ? "En Cours..." : "Publier"}
        </button>

        {/* {"Progress:" + progress}
        {mutation.isError && <span>{mutation.error.message}</span>} */}
      </form>
    </div>
  );
};

export default Write;
