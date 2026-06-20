import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@nutrivae/shared";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sprout } from "lucide-react";
import { useAuth } from "../lib/auth";
import { FormField } from "../components/forms";

export function LoginPage() {
  const { user, login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@nutrivae.com", password: "Welcome123!" }
  });
  if (user) return <Navigate to="/" replace />;
  const submit = async (data: LoginInput) => {
    try {
      await login(data);
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Unable to sign in" });
    }
  };
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full border-[60px] border-brand-700/30" />
        <div className="absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-brand-700/30 blur-2xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-butter text-brand-900">
            <Sprout size={22} />
          </span>
          <span className="font-display text-xl font-extrabold">Nutrivae HRMS</span>
        </div>
        <div className="relative my-auto max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-butter">
            A healthier way to run your workplace
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.08]">
            People thrive when work feels human.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">
            Bring your people, time off, goals, hiring, and compensation into one calm, connected workspace.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-white/75">
            <span className="flex items-center gap-3">
              <CheckCircle2 className="text-butter" size={18} />
              One source of truth for every employee
            </span>
            <span className="flex items-center gap-3">
              <CheckCircle2 className="text-butter" size={18} />
              Simple workflows that teams actually use
            </span>
            <span className="flex items-center gap-3">
              <CheckCircle2 className="text-butter" size={18} />
              Clear insights without spreadsheet archaeology
            </span>
          </div>
        </div>
        <p className="relative text-xs text-white/35">© 2026 Nutrivae. Built for teams with momentum.</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] animate-in">
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-butter">
              <Sprout size={20} />
            </span>
            <span className="font-display text-lg font-extrabold">Nutrivae</span>
          </div>
          <p className="eyebrow text-brand-600">Welcome back</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Sign in to your workspace</h2>
          <p className="mt-2 text-sm text-muted">Your team’s day starts here.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
            <FormField label="Work email" type="email" error={errors.email?.message} {...register("email")} />
            <FormField
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            {errors.root && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
            )}
            <button disabled={isSubmitting} className="btn-primary h-12 w-full">
              {isSubmitting ? "Signing in…" : "Continue"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="mt-6 rounded-xl bg-brand-50 p-3 text-xs leading-5 text-brand-900">
            <strong>Demo access</strong>
            <br />
            admin@nutrivae.com · Welcome123!
          </div>
        </div>
      </section>
    </div>
  );
}
