import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import { Avatar, Badge } from "../components";
import { FormField, PageHeader, TextAreaField } from "../components";
import { ProjectAssignDrawer, ProjectCreateDrawer } from "../components/drawers";
import { useAuth } from "../lib/auth";

type Project = {
  id: string;
  name: string;
  code: string;
  description?: string;
  clientName?: string;
  status: string;
  assignments: Array<{
    employeeId: string;
    role?: string;
    allocation: number;
    employee: { id: string; firstName: string; lastName: string; jobTitle?: { name: string } };
  }>;
};

export function ProjectsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignProject, setAssignProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    code: "",
    description: "",
    clientName: "",
    status: "ACTIVE"
  });
  const [assignmentForm, setAssignmentForm] = useState({ employeeId: "", role: "", allocation: "100" });
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => api.get<Project[]>("/projects") });
  const employees = useQuery({
    queryKey: ["project-employees"],
    queryFn: () =>
      api.get<Array<{ id: string; firstName: string; lastName: string }>>("/employees?pageSize=50")
  });
  const canManage = user?.role === "ADMIN" || user?.permissions.includes("projects.manage");
  const refresh = () => void client.invalidateQueries({ queryKey: ["projects"] });
  const create = useMutation({
    mutationFn: () => api.post("/projects", projectForm),
    onSuccess: () => {
      setCreateOpen(false);
      setProjectForm({ name: "", code: "", description: "", clientName: "", status: "ACTIVE" });
      refresh();
    }
  });
  const assign = useMutation({
    mutationFn: () =>
      api.post(`/projects/${assignProject!.id}/assignments`, {
        ...assignmentForm,
        allocation: Number(assignmentForm.allocation)
      }),
    onSuccess: () => {
      setAssignProject(null);
      setAssignmentForm({ employeeId: "", role: "", allocation: "100" });
      refresh();
    }
  });

  return (
    <div className="page">
      <PageHeader
        eyebrow="Work management"
        title="Projects"
        description={
          canManage ? "Create projects and manage employee allocation." : "Projects assigned to you."
        }
        actions={
          canManage && (
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={17} /> New project
            </button>
          )
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {projects.data?.data.map((project) => (
          <article className="card p-5" key={project.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone={project.status === "ACTIVE" ? "green" : "neutral"}>{project.status}</Badge>
                <h2 className="mt-3 font-display text-xl font-bold">{project.name}</h2>
                <p className="mt-1 text-xs text-muted">
                  {project.code} {project.clientName && `· ${project.clientName}`}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <FolderKanban size={18} />
              </span>
            </div>
            {project.description && (
              <p className="mt-4 text-sm leading-6 text-muted">{project.description}</p>
            )}
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <Users size={15} /> {project.assignments.length} assigned
                </span>
                {canManage && (
                  <button className="btn-secondary !px-3 !py-2" onClick={() => setAssignProject(project)}>
                    <UserPlus size={15} /> Assign
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.assignments.map((assignment) => {
                  const name = `${assignment.employee.firstName} ${assignment.employee.lastName}`;
                  return (
                    <div
                      className="flex items-center gap-2 rounded-full bg-canvas py-1 pl-1 pr-3"
                      key={assignment.employeeId}
                    >
                      <Avatar name={name} size="sm" />
                      <span className="text-xs font-semibold">{name}</span>
                      <span className="text-[10px] text-muted">{assignment.allocation}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
      <ProjectCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectForm={projectForm}
        onChange={(form) => setProjectForm(form)}
        onSubmit={() => create.mutate()}
        isPending={create.isPending}
      />
      <ProjectAssignDrawer
        open={Boolean(assignProject)}
        onClose={() => setAssignProject(null)}
        employees={employees.data?.data ?? []}
        assignmentForm={assignmentForm}
        onChange={(form) => setAssignmentForm(form)}
        onSubmit={() => assign.mutate()}
        isPending={assign.isPending}
      />
    </div>
  );
}
