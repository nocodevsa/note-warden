
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If still checking authentication status, show loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success("Login successful");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Noteflow</h1>
            <p className="mt-3 text-gray-400">
              Your all-in-one workspace for notes and ideas
            </p>
          </div>

          <div className="mt-8 space-y-6 rounded-xl bg-gray-800/50 p-8 shadow-xl backdrop-blur">
            <h2 className="text-2xl font-semibold">Log in to your account</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          className="bg-gray-700 border-gray-600"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          className="bg-gray-700 border-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-400 mt-4">
              <p>
                For demo, use any email and password with 6+ characters
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-violet-700 p-12">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-6">
            Capture ideas your way
          </h2>
          <p className="text-xl mb-8">
            Noteflow combines seamless note-taking, drag-and-drop organization, a floating drawing canvas, 
            and an infinite whiteboard to help you capture ideas your way. With nested folders, rich text editing, 
            and instant search, it's the perfect space to write, draw, and stay organized effortlessly. 🚀
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Rich editing</h3>
                <p className="text-sm opacity-80">Markdown support with live preview</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Nested organization</h3>
                <p className="text-sm opacity-80">Keep everything structured</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Split views</h3>
                <p className="text-sm opacity-80">Work with multiple notes at once</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Customizable</h3>
                <p className="text-sm opacity-80">Personalize your workspace</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
