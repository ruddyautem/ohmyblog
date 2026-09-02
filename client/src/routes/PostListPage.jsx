import { useState } from "react";
import PostList from "../components/PostList.jsx";
import SideMenu from "../components/SideMenu.jsx";

const PostListPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="">
      <h1 className="mb-8 text-2xl">Tous les posts</h1>
      
      <button
        className="mb-4 rounded bg-gray-200 px-4 py-2 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Fermer" : "Filtrer ou rechercher"}
      </button>
      <div className="flex flex-col-reverse gap-8 md:flex-row">
        <div className="">
          <PostList />
        </div>
        <div className={`${open ? "block" : "hidden"} md:block`}>
          <SideMenu />
        </div>
      </div>
    </div>
  );
};

export default PostListPage;
