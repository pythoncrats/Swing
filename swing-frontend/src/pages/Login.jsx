import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import { Field, TextInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";

const HOME_BY_ROLE = { trainee: "/trainee", trainer: "/trainer", admin: "/admin" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await login(values);
      const target = location.state?.from || HOME_BY_ROLE[user.role] || "/";
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Swing"
      description="Trainees, trainers and administrators all sign in here — you'll land on your own dashboard."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Email address" required error={errors.email?.message}>
          <TextInput
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            {...register("email", { required: "Enter your email address." })}
          />
        </Field>

        <Field label="Password" required error={errors.password?.message}>
          <TextInput
            type="password"
            placeholder="Your password"
            error={errors.password}
            {...register("password", { required: "Enter your password." })}
          />
        </Field>

        {serverError && (
          <p className="rounded-xl bg-coral-500/10 px-3.5 py-2.5 text-sm text-coral-600">{serverError}</p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to Swing?{" "}
        <Link to="/register" className="font-medium text-navy-900 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-paper-200 bg-paper-50 p-4 text-xs text-ink-500">
        <p className="mb-1.5 font-semibold text-ink-700">Demo accounts</p>
        <p>Admin — admin@gmail.com / admin12345@</p>
        <p>Trainer — grace.trainer@swing.ug / trainer123</p>
        <p>Trainee (certified) — samuel.trainee@example.com / trainee123</p>
      </div>
    </AuthLayout>
  );
}
