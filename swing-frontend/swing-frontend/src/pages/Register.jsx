import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import { Field, TextInput } from "../components/ui/Field";
import * as api from "../lib/mockApi";

const ROLES = [
  {
    value: "trainee",
    label: "Trainee",
    desc: "I want to learn a skill and get certified",
    icon: GraduationCap,
  },
  {
    value: "trainer",
    label: "Trainer",
    desc: "I want to train trainees in my skill area",
    icon: ShieldCheck,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("trainee");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "", email: "", phone: "", location: "", password: "" } });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { devOtp } = await api.sendOtp({ email: values.email, purpose: "register" });
      navigate("/verify-otp", {
        state: {
          pendingRegistration: { ...values, role },
          devOtp,
        },
      });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create your account"
      title="Join Swing"
      description="Tell us which kind of account this is — you'll only ever see the dashboard that matches it."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">I am registering as</span>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`rounded-2xl border p-3.5 text-left transition-all ${
                  role === r.value
                    ? "border-navy-900 bg-navy-900 text-paper-50 shadow-swing-sm"
                    : "border-paper-200 bg-white text-ink-900 hover:border-navy-400/40"
                }`}
              >
                <r.icon size={18} strokeWidth={1.75} className={role === r.value ? "text-amber-400" : "text-navy-700"} />
                <p className="mt-2 font-display text-sm font-semibold">{r.label}</p>
                <p className={`mt-0.5 text-xs ${role === r.value ? "text-paper-200/70" : "text-ink-500"}`}>
                  {r.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Field label="Full name" required error={errors.name?.message}>
          <TextInput
            placeholder="e.g. Sarah Nabirye"
            error={errors.name}
            {...register("name", { required: "Your full name is required." })}
          />
        </Field>

        <Field label="Email address" required error={errors.email?.message}>
          <TextInput
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            {...register("email", {
              required: "An email address is required.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
            })}
          />
        </Field>

        <Field label="Phone number" required error={errors.phone?.message}>
          <TextInput
            type="tel"
            placeholder="+256 7XX XXX XXX"
            error={errors.phone}
            {...register("phone", { required: "A phone number is required." })}
          />
        </Field>

        {role === "trainee" && (
          <Field label="Location" error={errors.location?.message}>
            <TextInput
              placeholder="e.g. Mukono, Uganda"
              {...register("location")}
            />
          </Field>
        )}

        <Field label="Password" required error={errors.password?.message}>
          <TextInput
            type="password"
            placeholder="At least 8 characters"
            error={errors.password}
            {...register("password", {
              required: "Choose a password.",
              minLength: { value: 8, message: "Use at least 8 characters." },
            })}
          />
        </Field>

        <Field label="Confirm password" required error={errors.confirm?.message}>
          <TextInput
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirm}
            {...register("confirm", {
              required: "Confirm your password.",
              validate: (v) => v === password || "Passwords don't match.",
            })}
          />
        </Field>

        {serverError && (
          <p className="rounded-xl bg-coral-500/10 px-3.5 py-2.5 text-sm text-coral-600">{serverError}</p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send verification code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-navy-900 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
