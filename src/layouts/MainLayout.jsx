import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="lx:px-32 px-4 md:px-8 lg:px-16 2xl:px-64">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
