import { Outlet, ScrollRestoration } from "react-router";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="lx:px-32 px-4 md:px-8 lg:px-16 2xl:px-64">
      <Navbar />
      <Outlet />
      <ScrollRestoration 
        getKey={(location, matches) => {
          // Always return null to force scroll to top on every navigation
          return null;
        }}
      />
    </div>
  );
};

export default MainLayout;