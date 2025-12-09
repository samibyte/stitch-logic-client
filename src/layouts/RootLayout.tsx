import Footer from "@/pages/Home/Shared/Footer";
import Navbar from "@/pages/Home/Shared/Navbar";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main className="mx-auto mt-36 min-h-full max-w-11/12 md:max-w-9/12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
