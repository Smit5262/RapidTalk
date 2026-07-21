import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MessagesSquare, Sparkles, ShieldCheck, Zap } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const HIGHLIGHTS = [
  { icon: Zap, text: "Real-time messaging that feels instant" },
  { icon: Sparkles, text: "AI summaries, replies, and translation built in" },
  { icon: ShieldCheck, text: "Role-based access across every workspace" },
];

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Left: form */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        {/* Ambient background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[20%] -top-[30%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[20%] h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25">
              <MessagesSquare size={22} aria-hidden />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {children}
          </div>

          {/* Condensed value prop for viewports without the brand panel */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:hidden">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon size={13} className="text-primary" aria-hidden />
                {text.split(" ").slice(0, 2).join(" ")}
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </main>

      {/* Right: brand panel (desktop only) */}
      <aside className="relative hidden w-[42%] max-w-2xl overflow-hidden border-l border-border bg-gradient-to-br from-primary via-primary to-indigo-700 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.15), transparent 45%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <MessagesSquare size={18} aria-hidden />
            RapidTalk
          </div>

          <div>
            <blockquote className="text-2xl font-semibold leading-snug tracking-tight text-balance xl:text-3xl">
              The fastest way for modern teams to talk, share, and stay in sync.
            </blockquote>
            <ul className="mt-8 space-y-3.5">
              {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/10 backdrop-blur-sm">
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className="text-sm text-primary-foreground/90">{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} RapidTalk. All rights reserved.
          </p>
        </div>
      </aside>
    </div>
  );
}
