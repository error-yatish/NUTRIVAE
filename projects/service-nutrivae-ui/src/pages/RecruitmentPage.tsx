import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Users, MoreHorizontal } from "lucide-react";
import { api } from "../lib/api";
import { Avatar, Badge, Skeleton } from "../components/ui";
import { JobOpeningDrawer } from "../components/drawers";
import { useState } from "react";
import { useAuth } from "../lib/auth";

type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  status: string;
  department: { name: string };
  candidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    currentStage: string;
  }>;
};
export function RecruitmentPage() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["jobs"], queryFn: () => api.get<Job[]>("/recruitment/jobs") });
  const meta = useQuery({
    queryKey: ["employee-meta"],
    queryFn: () => api.get<{ departments: Array<{ id: string; name: string }> }>("/employees/meta")
  });
  const candidates =
    query.data?.data.flatMap((job) =>
      job.candidates.map((candidate) => ({ ...candidate, job: job.title }))
    ) ?? [];
  const canCreate = ["ADMIN", "HR_MANAGER"].includes(user?.role ?? "");
  return (
    <div className="animate-in space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Talent acquisition</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Recruitment</h1>
          <p className="mt-2 text-sm text-muted">Find great people and make every candidate feel valued.</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            New opening
          </button>
        )}
      </div>
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.3fr]">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Open roles</h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
              {query.data?.data.length ?? 0}
            </span>
          </div>
          <div className="space-y-3">
            {query.isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              query.data?.data.map((job) => (
                <div className="rounded-2xl border border-line p-4" key={job.id}>
                  <div className="flex justify-between">
                    <Badge tone="green">{job.status.toLowerCase()}</Badge>
                    <MoreHorizontal size={17} className="text-muted" />
                  </div>
                  <h3 className="mt-3 font-display font-bold">{job.title}</h3>
                  <p className="mt-1 text-xs text-muted">{job.department.name}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                    <span className="flex gap-1">
                      <MapPin size={13} />
                      {job.location}
                    </span>
                    <span className="flex gap-1">
                      <Users size={13} />
                      {job.candidates.length}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="border-b border-line p-5">
            <h2 className="font-display text-lg font-bold">Candidate pipeline</h2>
            <p className="mt-1 text-xs text-muted">Latest people moving through your hiring flow</p>
          </div>
          <div className="divide-y divide-line">
            {candidates.map((candidate) => {
              const name = `${candidate.firstName} ${candidate.lastName}`;
              return (
                <div className="flex items-center gap-3 p-5" key={candidate.id}>
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted">{candidate.job}</div>
                  </div>
                  <div className="text-right">
                    <Badge tone={candidate.status === "OFFER" ? "violet" : "amber"}>
                      {candidate.currentStage}
                    </Badge>
                    <p className="mt-1 text-[10px] text-muted">Updated recently</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <JobOpeningDrawer
        open={open}
        onClose={() => setOpen(false)}
        departments={meta.data?.data.departments ?? []}
        onCreated={() => {
          setOpen(false);
          void client.invalidateQueries({ queryKey: ["jobs"] });
          void client.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />
    </div>
  );
}
