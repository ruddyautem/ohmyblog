// main.jsx
import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./lib/timeago-locale.js";

import Homepage from "./routes/Homepage.jsx";
import LoginPage from "./routes/LoginPage.jsx";
import PostListPage from "./routes/PostListPage.jsx";
import Register from "./routes/RegisterPage.jsx";
import SinglePostPage from "./routes/SinglePostPage.jsx";
import Write from "./routes/Write.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { frFR } from "@clerk/localizations";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const root = document.getElementById("root");

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Homepage },
      { path: "posts", Component: PostListPage },
      { path: ":slug", Component: SinglePostPage },
      { path: "write", Component: Write },
      { path: "login", Component: LoginPage },
      { path: "register", Component: Register },
    ],
  },
]);

ReactDOM.createRoot(root).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl="/"
    localization={frFR}
  >
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" />
    </QueryClientProvider>
  </ClerkProvider>,
);