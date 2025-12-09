import Footer from "@/pages/Home/Shared/Footer";
import Navbar from "@/pages/Home/Shared/Navbar";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div className="max-w-11/12 md:max-w-9/12 mx-auto">
      <header>
        <Navbar />
      </header>
      <main className="min-h-full mt-36">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
