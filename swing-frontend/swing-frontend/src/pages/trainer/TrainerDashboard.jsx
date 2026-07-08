import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LayoutDashboard, UserCog, Users, Award } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import { Card, SectionHeading, EmptyState } from "../../components/ui/Surfaces";
import { Field, TextInput, Textarea } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../lib/mockApi";

const NAV = [{ to: "/trainer", label: "Overview", icon: LayoutDashboard, end: true }];

export default function TrainerDashboard() {
  const { user, refreshUser } = useAuth();
  const [assigned, setAssigned] = useState([]);
  const [certified, setCertified] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsText, setSkillsText] = useState((user.skills || []).join(", "));
  const [savedMsg, setSavedMsg] = useState("");
  const [certifyingId, setCertifyingId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      bio: user.bio || "",
      education: user.education || "",
      phone: user.phone || "",
    },
  });

  const loadTrainees = async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      api.getAssignedTrainees(user.id),
      api.getCertifiedTraineesByTrainer(user.id),
    ]);
    setAssigned(a);
    setCertified(c);
    setLoading(false);
  };

  useEffect(() => {
    loadTrainees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const onProfileSave = async (values) => {
    setSaving(true);
    setSavedMsg("");
    await api.updateTrainerProfile(user.id, {
      ...values,
      skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
    });
    refreshUser();
    setSaving(false);
    setSavedMsg("Profile updated. Admins and trainees can see this.");
  };

  const certify = async (traineeId) => {
    setCertifyingId(traineeId);
    await api.certifyTrainee(traineeId);
    await loadTrainees();
    setCertifyingId(null);
  };

  return (
    <AppShell navItems={NAV}>
      <SectionHeading
        eyebrow="Trainer dashboard"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Manage the trainees assigned to you and keep your training profile up to date."
      />

      {savedMsg && (
        <p className="mb-5 rounded-xl bg-teal-500/10 px-4 py-2.5 text-sm text-teal-700">{savedMsg}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <UserCog size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Your training profile</p>
          </div>
          <p className="mb-4 text-xs text-ink-500">
            Only administrators and trainees can see this, and it's shown on your trainer profile.
          </p>
          <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
            <Field label="About you & your skills" error={errors.bio?.message}>
              <Textarea rows={3} placeholder="Tell trainees what you teach and how you teach it." {...register("bio")} />
            </Field>
            <Field label="Specific skills" hint="Separate multiple skills with commas.">
              <TextInput
                placeholder="e.g. Web Development, UI/UX Design"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Education">
                <TextInput placeholder="e.g. BSc. Computer Science" {...register("education")} />
              </Field>
              <Field label="Phone number">
                <TextInput {...register("phone")} />
              </Field>
            </div>
            <Button type="submit" size="sm" loading={saving} disabled={!isDirty && skillsText === (user.skills || []).join(", ")}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Award size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">At a glance</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">In training</dt>
              <dd className="font-mono font-semibold text-navy-900">{assigned.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Certified so far</dt>
              <dd className="font-mono font-semibold text-teal-600">{certified.length}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Trainees assigned to you</p>
          </div>
          {loading ? (
            <p className="text-sm text-ink-500">Loading...</p>
          ) : assigned.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No trainees assigned yet"
              description="You'll get a notification the moment an administrator assigns a new trainee to you."
            />
          ) : (
            <div className="divide-y divide-paper-100">
              {assigned.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">
                      {t.email} · {t.location || "Location not set"}
                    </p>
                    {t.skillsHave?.length > 0 && (
                      <p className="mt-1 text-xs text-ink-500">Has: {t.skillsHave.join(", ")}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="amber"
                    loading={certifyingId === t.id}
                    onClick={() => certify(t.id)}
                  >
                    Mark certified
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Award size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Trainees you've certified</p>
          </div>
          {certified.length === 0 ? (
            <EmptyState icon={Award} title="No certifications yet" description="Certified trainees will be listed here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {certified.map((t) => (
                <div key={t.id} className="rounded-2xl border border-paper-200 p-4">
                  <p className="text-sm font-medium text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.email}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
