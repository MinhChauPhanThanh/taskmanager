import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}