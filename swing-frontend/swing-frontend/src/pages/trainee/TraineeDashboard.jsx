import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LayoutDashboard, User, Sparkles, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "../../components/layout/AppShell";
import { Card, SectionHeading, StatusBadge, EmptyState } from "../../components/ui/Surfaces";
import { Field, TextInput, Textarea } from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import SwingArc from "../../components/ui/SwingArc";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../lib/mockApi";

const NAV = [
  { to: "/trainee", label: "Overview", icon: LayoutDashboard, end: true },
];

export default function TraineeDashboard() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [skillsState, setSkillsState] = useState({
    hasSkills: user.hasSkills,
    skillsHave: (user.skillsHave || []).join(", "),
    skillsWanted: (user.skillsWanted || []).join(", "),
    documentName: (user.documents || [])[0] || "",
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location || "",
    },
  });

  useEffect(() => {
    (async () => {
      setLoadingJobs(true);
      const recs = await api.getRecommendedJobs(user.id);
      setJobs(recs);
      setLoadingJobs(false);
    })();
  }, [user.id]);

  const onProfileSave = async (values) => {
    setSaving(true);
    setSavedMsg("");
    await api.updateTraineeProfile(user.id, values);
    refreshUser();
    setSaving(false);
    setSavedMsg("Profile updated.");
  };

  const onSkillsSave = async () => {
    setSaving(true);
    setSavedMsg("");
    await api.updateTraineeSkills(user.id, {
      hasSkills: skillsState.hasSkills,
      skillsHave: skillsState.hasSkills
        ? skillsState.skillsHave.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      skillsWanted: !skillsState.hasSkills
        ? skillsState.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      documents: skillsState.documentName ? [skillsState.documentName] : [],
    });
    refreshUser();
    setSaving(false);
    setSavedMsg("Skills information updated.");
  };

  const applyToJob = async (recId) => {
    await api.applyToRecommendation(recId);
    const recs = await api.getRecommendedJobs(user.id);
    setJobs(recs);
  };

  return (
    <AppShell navItems={NAV}>
      <SectionHeading
        eyebrow="Trainee dashboard"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Keep your profile current, tell us about your skills, and track how close you are to certified."
      />

      {savedMsg && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl bg-teal-500/10 px-4 py-2.5 text-sm text-teal-700"
        >
          {savedMsg}
        </motion.p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress */}
        <Card className="lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-ink-900">Your training journey</p>
            <StatusBadge status={user.status} />
          </div>
          {user.status === "rejected" ? (
            <div className="mt-4">
              <SwingArc rejected />
              {user.rejectionReason && (
                <p className="mt-3 rounded-xl bg-paper-50 p-3 text-sm text-ink-700">
                  <span className="font-medium">Admin's note: </span>
                  {user.rejectionReason}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <SwingArc status={user.status} applied={jobs.some((j) => j.applied)} />
            </div>
          )}
          {user.status === "pending" && (
            <p className="mt-4 text-sm text-ink-500">
              Your registration is with an administrator for review. You'll be assigned a trainer soon.
            </p>
          )}
        </Card>

        {/* Profile */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <User size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Profile</p>
          </div>
          <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={profileErrors.name?.message}>
                <TextInput {...registerProfile("name", { required: "Required" })} />
              </Field>
              <Field label="Email address" error={profileErrors.email?.message}>
                <TextInput type="email" {...registerProfile("email", { required: "Required" })} />
              </Field>
              <Field label="Phone number" error={profileErrors.phone?.message}>
                <TextInput {...registerProfile("phone", { required: "Required" })} />
              </Field>
              <Field label="Location">
                <TextInput placeholder="e.g. Mukono, Uganda" {...registerProfile("location")} />
              </Field>
            </div>
            <Button type="submit" size="sm" loading={saving} disabled={!profileDirty}>
              Save profile
            </Button>
          </form>
        </Card>

        {/* Status summary */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">At a glance</p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Status</dt>
              <dd className="font-medium text-ink-900">
                <StatusBadge status={user.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Trainer assigned</dt>
              <dd className="font-medium text-ink-900">{user.assignedTrainerId ? "Yes" : "Not yet"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Recommended jobs</dt>
              <dd className="font-mono font-medium text-navy-900">{jobs.length}</dd>
            </div>
          </dl>
        </Card>

        {/* Skills */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Skills</p>
          </div>

          <div className="mb-4 flex gap-3">
            {[
              { v: true, label: "I already have skills" },
              { v: false, label: "I'm looking to learn" },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setSkillsState((s) => ({ ...s, hasSkills: opt.v }))}
                className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  skillsState.hasSkills === opt.v
                    ? "border-navy-900 bg-navy-900 text-paper-50"
                    : "border-paper-200 text-ink-700 hover:border-navy-400/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {skillsState.hasSkills ? (
            <div className="space-y-4">
              <Field label="Skills you have" hint="Separate multiple skills with commas.">
                <Textarea
                  rows={2}
                  placeholder="e.g. Basic HTML, Basic CSS, Customer service"
                  value={skillsState.skillsHave}
                  onChange={(e) => setSkillsState((s) => ({ ...s, skillsHave: e.target.value }))}
                />
              </Field>
              <Field label="Attach supporting document" hint="e.g. a certificate or ID scan (file name only in this demo).">
                <input
                  type="file"
                  onChange={(e) =>
                    setSkillsState((s) => ({ ...s, documentName: e.target.files?.[0]?.name || "" }))
                  }
                  className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-900 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-paper-50 hover:file:bg-navy-800"
                />
                {skillsState.documentName && (
                  <p className="mt-1.5 text-xs text-teal-600">Attached: {skillsState.documentName}</p>
                )}
              </Field>
            </div>
          ) : (
            <Field label="Skills you'd like to learn" hint="Separate multiple skills with commas.">
              <Textarea
                rows={2}
                placeholder="e.g. Web Development, Graphic Design"
                value={skillsState.skillsWanted}
                onChange={(e) => setSkillsState((s) => ({ ...s, skillsWanted: e.target.value }))}
              />
            </Field>
          )}

          <Button type="button" size="sm" className="mt-4" loading={saving} onClick={onSkillsSave}>
            Save skills information
          </Button>
        </Card>

        {/* Jobs */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-navy-700" />
            <p className="font-display text-sm font-semibold text-ink-900">Recommended jobs</p>
          </div>

          {user.status !== "certified" ? (
            <EmptyState
              icon={Briefcase}
              title="Jobs appear once you're certified"
              description="Finish your training and get certified by your trainer to start receiving job recommendations from an administrator."
            />
          ) : loadingJobs ? (
            <p className="text-sm text-ink-500">Loading...</p>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No recommendations yet"
              description="An administrator will recommend suitable job openings here as they become available."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {jobs.map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-paper-200 p-4">
                  <p className="font-display text-sm font-semibold text-ink-900">{rec.job?.title}</p>
                  <p className="text-xs text-ink-500">
                    {rec.job?.company} · {rec.job?.location}
                  </p>
                  <p className="mt-2 text-sm text-ink-700">{rec.job?.description}</p>
                  <Button
                    size="sm"
                    variant={rec.applied ? "subtle" : "amber"}
                    className="mt-3.5"
                    disabled={rec.applied}
                    onClick={() => applyToJob(rec.id)}
                  >
                    {rec.applied ? "Applied" : "Apply now"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
