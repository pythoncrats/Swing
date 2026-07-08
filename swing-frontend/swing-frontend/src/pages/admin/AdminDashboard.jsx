import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Clock,
  Users,
  XCircle,
  Award,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import { Card, SectionHeading, StatusBadge, EmptyState } from "../../components/ui/Surfaces";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, TextInput, Textarea, Select } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../lib/mockApi";

const NAV = [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }];

const TABS = [
  { key: "pending", label: "Pending review", icon: Clock },
  { key: "assigned", label: "In training", icon: Users },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "certified", label: "Certified & jobs", icon: Award },
  { key: "trainers", label: "Trainers", icon: ShieldCheck },
  { key: "jobs", label: "Job listings", icon: Briefcase },
];

export default function AdminDashboard() {
  useAuth();
  const [tab, setTab] = useState("pending");
  const [trainees, setTrainees] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignTarget, setAssignTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [recommendTarget, setRecommendTarget] = useState(null);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [jobModal, setJobModal] = useState(null); // { mode: 'add' | 'edit', job }

  const loadAll = async () => {
    setLoading(true);
    const [t, tr, j] = await Promise.all([api.getAllTrainees(), api.getAllTrainers(), api.getJobs()]);
    setTrainees(t);
    setTrainers(tr);
    setJobs(j);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pending = useMemo(() => trainees.filter((t) => t.status === "pending"), [trainees]);
  const assigned = useMemo(() => trainees.filter((t) => t.status === "in_training"), [trainees]);
  const rejected = useMemo(() => trainees.filter((t) => t.status === "rejected"), [trainees]);
  const certified = useMemo(() => trainees.filter((t) => t.status === "certified"), [trainees]);

  const trainerName = (id) => trainers.find((t) => t.id === id)?.name || "—";

  return (
    <AppShell navItems={NAV}>
      <SectionHeading
        eyebrow="Administrator dashboard"
        title="Review, assign, and connect trainees to jobs"
        description="Everything a trainee or trainer sees flows from decisions made here."
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-paper-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-navy-900 text-paper-50" : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {t.key === "pending" && pending.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-xs text-navy-950">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Loading...</p>
      ) : (
        <>
          {tab === "pending" && (
            <Card>
              <p className="mb-4 font-display text-sm font-semibold text-ink-900">
                Awaiting review ({pending.length})
              </p>
              {pending.length === 0 ? (
                <EmptyState icon={Clock} title="Nothing to review" description="New sign-ups will show up here." />
              ) : (
                <div className="divide-y divide-paper-100">
                  {pending.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{t.name}</p>
                        <p className="text-xs text-ink-500">
                          {t.email} · {t.phone} · {t.location || "No location given"}
                        </p>
                        <p className="mt-1 text-xs text-ink-500">
                          {t.hasSkills
                            ? `Has skills: ${t.skillsHave.join(", ") || "—"}`
                            : `Wants to learn: ${t.skillsWanted.join(", ") || "—"}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setRejectTarget(t)}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => setAssignTarget(t)}>
                          Assign trainer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "assigned" && (
            <Card>
              <p className="mb-4 font-display text-sm font-semibold text-ink-900">
                In training ({assigned.length})
              </p>
              {assigned.length === 0 ? (
                <EmptyState icon={Users} title="No one in training right now" />
              ) : (
                <div className="divide-y divide-paper-100">
                  {assigned.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{t.name}</p>
                        <p className="text-xs text-ink-500">{t.email}</p>
                      </div>
                      <p className="text-sm text-ink-700">
                        Trainer: <span className="font-medium">{trainerName(t.assignedTrainerId)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "rejected" && (
            <Card>
              <p className="mb-4 font-display text-sm font-semibold text-ink-900">
                Rejected ({rejected.length})
              </p>
              {rejected.length === 0 ? (
                <EmptyState icon={XCircle} title="No rejected applications" />
              ) : (
                <div className="divide-y divide-paper-100">
                  {rejected.map((t) => (
                    <div key={t.id} className="py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink-900">{t.name}</p>
                        <StatusBadge status="rejected" />
                      </div>
                      <p className="text-xs text-ink-500">{t.email}</p>
                      <p className="mt-1.5 rounded-lg bg-coral-500/5 px-3 py-2 text-xs text-coral-600">
                        {t.rejectionReason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "certified" && (
            <Card>
              <p className="mb-4 font-display text-sm font-semibold text-ink-900">
                Certified trainees ({certified.length})
              </p>
              {certified.length === 0 ? (
                <EmptyState icon={Award} title="No certified trainees yet" />
              ) : (
                <div className="divide-y divide-paper-100">
                  {certified.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{t.name}</p>
                        <p className="text-xs text-ink-500">
                          {t.email} · trained by {trainerName(t.assignedTrainerId)}
                        </p>
                        {t.skillsHave?.length > 0 && (
                          <p className="mt-1 text-xs text-ink-500">Skills: {t.skillsHave.join(", ")}</p>
                        )}
                      </div>
                      <Button size="sm" variant="amber" onClick={() => setRecommendTarget(t)}>
                        Recommend a job
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "trainers" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {trainers.map((t) => {
                const handled = trainees.filter((tr) => tr.assignedTrainerId === t.id);
                return (
                  <Card key={t.id}>
                    <p className="font-display text-sm font-semibold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.email}</p>
                    <p className="mt-2 text-sm text-ink-700 line-clamp-2">{t.bio || "No bio provided yet."}</p>
                    <p className="mt-2 text-xs text-ink-500">
                      Skills: {t.skills?.length ? t.skills.join(", ") : "Not listed"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-navy-900">
                        {handled.length} trainee(s) handled
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setTrainerProfile(t)}>
                        View profile
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {tab === "jobs" && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-ink-900">
                  Job listings ({jobs.length})
                </p>
                <Button size="sm" onClick={() => setJobModal({ mode: "add" })}>
                  Add job
                </Button>
              </div>
              <div className="divide-y divide-paper-100">
                {jobs.map((j) => (
                  <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{j.title}</p>
                      <p className="text-xs text-ink-500">
                        {j.company} · {j.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setJobModal({ mode: "edit", job: j })}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          await api.deleteJob(j.id);
                          loadAll();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <AssignModal target={assignTarget} trainers={trainers} onClose={() => setAssignTarget(null)} onDone={loadAll} />
      <RejectModal target={rejectTarget} onClose={() => setRejectTarget(null)} onDone={loadAll} />
      <RecommendModal target={recommendTarget} jobs={jobs} onClose={() => setRecommendTarget(null)} onDone={loadAll} />
      <TrainerProfileModal
        trainer={trainerProfile}
        trainees={trainees.filter((tr) => tr.assignedTrainerId === trainerProfile?.id)}
        onClose={() => setTrainerProfile(null)}
      />
      <JobModal state={jobModal} onClose={() => setJobModal(null)} onDone={loadAll} />
    </AppShell>
  );
}

function AssignModal({ target, trainers, onClose, onDone }) {
  const [trainerId, setTrainerId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTrainerId(trainers[0]?.id || "");
  }, [target, trainers]);

  if (!target) return null;

  const submit = async () => {
    if (!trainerId) return;
    setBusy(true);
    await api.assignTraineeToTrainer(target.id, trainerId);
    setBusy(false);
    onDone();
    onClose();
  };

  return (
    <Modal open={!!target} onClose={onClose} title={`Assign ${target.name} to a trainer`}>
      <Field label="Trainer">
        <Select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.skills?.[0] || "General"}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={busy} onClick={submit}>
          Confirm assignment
        </Button>
      </div>
    </Modal>
  );
}

function RejectModal({ target, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setReason(""), [target]);
  if (!target) return null;

  const submit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    await api.rejectTrainee(target.id, reason.trim());
    setBusy(false);
    onDone();
    onClose();
  };

  return (
    <Modal open={!!target} onClose={onClose} title={`Reject ${target.name}'s registration`}>
      <Field label="Reason" hint="The trainee will see this note on their dashboard.">
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this application isn't moving forward..." />
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={submit}>
          Confirm rejection
        </Button>
      </div>
    </Modal>
  );
}

function RecommendModal({ target, jobs, onClose, onDone }) {
  const [jobId, setJobId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setJobId(jobs[0]?.id || "");
    setError("");
  }, [target, jobs]);

  if (!target) return null;

  const submit = async () => {
    if (!jobId) return;
    setBusy(true);
    setError("");
    try {
      await api.recommendJobToTrainee(target.id, jobId);
      onDone();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!target} onClose={onClose} title={`Recommend a job to ${target.name}`}>
      {jobs.length === 0 ? (
        <p className="text-sm text-ink-500">Add a job listing first, then come back to recommend it.</p>
      ) : (
        <>
          <Field label="Job opening">
            <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company}
                </option>
              ))}
            </Select>
          </Field>
          {error && <p className="mt-2 text-sm text-coral-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={busy} onClick={submit}>
              Send recommendation
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function TrainerProfileModal({ trainer, trainees, onClose }) {
  if (!trainer) return null;
  return (
    <Modal open={!!trainer} onClose={onClose} title={trainer.name} width="max-w-lg">
      <p className="text-sm text-ink-500">{trainer.email}</p>
      <p className="text-sm text-ink-500">{trainer.phone}</p>
      <p className="mt-3 text-sm text-ink-700">{trainer.bio || "No bio provided yet."}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-ink-500">Education</p>
          <p className="font-medium text-ink-900">{trainer.education || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-ink-500">Skills</p>
          <p className="font-medium text-ink-900">{trainer.skills?.join(", ") || "—"}</p>
        </div>
      </div>
      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        Trainees handled ({trainees.length})
      </p>
      {trainees.length === 0 ? (
        <p className="text-sm text-ink-500">None yet.</p>
      ) : (
        <div className="space-y-2">
          {trainees.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-paper-50 px-3 py-2">
              <span className="text-sm text-ink-900">{t.name}</span>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function JobModal({ state, onClose, onDone }) {
  const [form, setForm] = useState({ title: "", company: "", location: "", description: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state?.mode === "edit") setForm(state.job);
    else setForm({ title: "", company: "", location: "", description: "" });
  }, [state]);

  if (!state) return null;

  const submit = async () => {
    if (!form.title || !form.company) return;
    setBusy(true);
    if (state.mode === "add") await api.addJob(form);
    else await api.updateJob(state.job.id, form);
    setBusy(false);
    onDone();
    onClose();
  };

  return (
    <Modal open={!!state} onClose={onClose} title={state.mode === "add" ? "Add a job listing" : "Edit job listing"}>
      <div className="space-y-4">
        <Field label="Job title" required>
          <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Company / Organisation" required>
          <TextInput value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
        </Field>
        <Field label="Location">
          <TextInput value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </Field>
        <Field label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={busy} onClick={submit}>
          {state.mode === "add" ? "Add job" : "Save changes"}
        </Button>
      </div>
    </Modal>
  );
}
