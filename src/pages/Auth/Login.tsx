import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogin from "./SocialLogin";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

export const title = "Login Form";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Login = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signInUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { email, password } = values;

      await signInUser(email, password);

      toast.success("Signed in successfully!", {
        position: "top-center",
      });
      navigate(location?.state || "/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="inter-font w-full max-w-md">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold">Welcome back</h1>
            <p className="text-foreground">Login with MoveXpress</p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <a
                    className="text-muted-foreground text-sm hover:underline"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <Input
                    className="bg-background"
                    placeholder="Enter your password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Sign In
          </Button>
          <SocialLogin />
          <p className="text-muted-foreground text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default Login;
