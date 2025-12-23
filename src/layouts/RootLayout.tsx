import Footer from "@/pages/Home/Shared/Footer";
import Navbar from "@/pages/Home/Shared/Navbar";
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router";
import { toast } from "sonner";

const RootLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment_success") === "true") {
      const tid = searchParams.get("id");

      toast.success("Payment Successful!", {
        description: `Order ${tid} is now being processed.`,
      });

      searchParams.delete("payment_success");
      searchParams.delete("id");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

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
