import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Lock,
  MessagesSquare,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { loginFormSchema, LoginFormValues } from "./schemas";
import { useLogin } from "./useAuth";
import { getPendingInvite, clearPendingInvite } from "@/utils/pendingInvite";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant messaging",
    text: "Real-time delivery that feels effortless across every team.",
  },
  {
    icon: Sparkles,
    title: "AI built in",
    text: "Summaries, smart replies, and translation without leaving the thread.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade access",
    text: "Granular role-based permissions across every workspace.",
  },
];

const STATS = [
  { value: "12k+", label: "Teams" },
  { value: "99.99%", label: "Uptime" },
  { value: "4.9", label: "Avg. rating" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const reduceMotion = useReducedMotion();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    const pending = getPendingInvite();
    if (pending) {
      clearPendingInvite();
      navigate(`/invite/${pending}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  });

  const floatAnim = reduceMotion
    ? undefined
    : {
        animate: { y: [0, -22, 0], x: [0, 14, 0] },
        transition: { duration: 16, repeat: Infinity, ease: "easeInOut" },
      };
  const floatAnimAlt = reduceMotion
    ? undefined
    : {
        animate: { y: [0, 24, 0], x: [0, -16, 0] },
        transition: { duration: 20, repeat: Infinity, ease: "easeInOut" },
      };

  return (
    <div className="app-bg grid min-h-dvh lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* ── Brand panel (desktop) ───────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-[hsl(243_65%_11%)] text-white lg:flex lg:flex-col">
        {/* Aurora glows */}
        <motion.div
          aria-hidden
          {...floatAnim}
          className="pointer-events-none absolute -left-24 -top-28 h-[520px] w-[520px] rounded-full bg-primary/40 blur-[130px]"
        />
        <motion.div
          aria-hidden
          {...floatAnimAlt}
          className="pointer-events-none absolute -bottom-32 -right-20 h-[460px] w-[460px] rounded-full bg-indigo-500/30 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/3 top-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]"
        />

        {/* Grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
              <MessagesSquare size={18} aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">RapidTalk</span>
          </div>

          {/* Hero copy + features */}
          <div className="max-w-md">
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
            >
              <Sparkles size={12} className="text-fuchsia-300" aria-hidden />
              Now with AI-powered conversations
            </motion.span>

            <motion.h2
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-balance xl:text-5xl"
            >
              The fastest way for modern teams to{" "}
              <span className="bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
                talk & stay in sync
              </span>
            </motion.h2>

            <ul className="mt-10 space-y-5">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
                <motion.li
                  key={title}
                  initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                    <Icon size={17} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/60">{text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social proof */}
          <div>
            <div className="flex items-center gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</p>
                  <p className="mt-0.5 text-xs text-white/55">{s.label}</p>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" aria-hidden />
                ))}
              </div>
            </div>
            <p className="mt-8 text-xs text-white/45">
              © {new Date().getFullYear()} RapidTalk. All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        {/* Ambient background (mobile + desktop) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[15%] -top-[25%] h-[440px] w-[440px] rounded-full bg-primary/[0.06] blur-3xl" />
          <div className="absolute -bottom-[25%] -left-[15%] h-[380px] w-[380px] rounded-full bg-primary/[0.04] blur-3xl" />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px]"
        >
          {/* Brand mark (mobile only) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25">
              <MessagesSquare size={18} aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              RapidTalk
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to your RapidTalk account to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <fieldset disabled={login.isPending} className="flex flex-col gap-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                error={errors.email?.message}
                icon={<Mail size={16} />}
                {...register("email")}
              />
              <FormField
                id="password"
                label="Password"
                autoComplete="current-password"
                placeholder="Enter your password"
                error={errors.password?.message}
                icon={<Lock size={16} />}
                revealable
                {...register("password")}
              />
            </fieldset>

            {login.isError && (
              <Alert variant="error">Invalid email or password. Please try again.</Alert>
            )}

            <Button
              type="submit"
              disabled={login.isPending}
              className="group mt-1 w-full"
              size="lg"
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="text-primary-foreground" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Log in
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
