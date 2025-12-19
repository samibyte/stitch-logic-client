import Footer from "@/pages/Home/Shared/Footer";
import Navbar from "@/pages/Home/Shared/Navbar";
import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main className="container mx-auto min-h-screen py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
