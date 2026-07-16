import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { loginFormSchema, LoginFormValues } from "./schemas";
import { useLogin } from "./useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    navigate("/", { replace: true });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Log in to RapidTalk</h1>
        <p className="mb-6 text-sm text-muted-foreground">Welcome back.</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {login.isError && (
            <p className="text-sm text-red-500">Invalid email or password.</p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {login.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}