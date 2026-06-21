import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, BriefcaseBusiness, ShieldCheck, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  SettingsDrawer,
  countryOptions,
  currencyOptions,
  permissions,
  timezoneOptions
} from "@/modules/settings";
import { useAuth } from "@/lib/auth";
import { ThemedSelect } from "@/components/forms";

type Organization = {
  company: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    country: string;
    timezone: string;
    legalName?: string;
    registrationNumber?: string;
    taxId?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  departments: Array<{ id: string; name: string; code: string }>;
  jobTitles: Array<{ id: string; name: string; level?: string }>;
  roles: Array<{ id: string; name: string; description?: string; permissions: string[] }>;
};

export function SettingsPage() {
  const client = useQueryClient();
  const { user, switchCompany } = useAuth();
  const query = useQuery({
    queryKey: ["organization"],
    queryFn: () => api.get<Organization>("/organization")
  });
  const [modal, setModal] = useState<"department" | "title" | "role" | "company" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [companyProfile, setCompanyProfile] = useState<Record<string, string>>({});
  const refresh = () => {
    setModal(null);
    setForm({});
    setSelectedPermissions([]);
    void client.invalidateQueries({ queryKey: ["organization"] });
    void client.invalidateQueries({ queryKey: ["employee-meta"] });
  };
  const create = useMutation({
    mutationFn: () => {
      if (modal === "department") return api.post("/departments", { name: form.name, code: form.code });
      if (modal === "title") return api.post("/job-titles", { name: form.name, level: form.level });
      if (modal === "role")
        return api.post("/roles", {
          name: form.name,
          description: form.description,
          permissions: selectedPermissions
        });
      return api.post("/companies", {
        name: form.name,
        slug: form.slug,
        currency: form.currency || "USD",
        country: form.country || "United States",
        timezone: form.timezone || "America/New_York",
        legalName: form.legalName,
        email: form.email
      });
    },
    onSuccess: (result) => {
      if (modal === "company") {
        void switchCompany((result.data as { id: string }).id);
        return;
      }
      refresh();
    }
  });
  const updateCompany = useMutation({
    mutationFn: () => api.patch("/company", companyProfile),
    onSuccess: () => {
      setCompanyProfile({});
      void client.invalidateQueries({ queryKey: ["organization"] });
      window.location.reload();
    }
  });
  const data = query.data?.data;
  return (
    <div className="animate-in space-y-6">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Workspace settings</h1>
        <p className="mt-2 text-sm text-muted">
          Shape your organization, access model, and workspace identity.
        </p>
      </div>
      <section className="grid gap-5 lg:grid-cols-2">
        <SettingsCard
          title="Companies"
          icon={Building2}
          action={() => setModal("company")}
          items={
            user?.companies.map((company) => ({
              title: company.name,
              detail: company.id === user.companyId ? "Current company" : "Available workspace"
            })) ?? []
          }
        />
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5">
            <h2 className="font-display font-bold">Company profile and localization</h2>
            <p className="mt-1 text-xs text-muted">
              Legal identity, country, currency, and operating timezone.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              updateCompany.mutate();
            }}
          >
            <div className="form-grid">
              <div>
                <label className="label">Display name</label>
                <input
                  className="input"
                  value={companyProfile.name ?? data?.company.name ?? ""}
                  onChange={(event) => setCompanyProfile({ ...companyProfile, name: event.target.value })}
                />
              </div>
              <div>
                <label className="label">Legal name</label>
                <input
                  className="input"
                  value={companyProfile.legalName ?? data?.company.legalName ?? ""}
                  onChange={(event) =>
                    setCompanyProfile({ ...companyProfile, legalName: event.target.value })
                  }
                />
              </div>
              <ThemedSelect
                label="Country"
                value={companyProfile.country ?? data?.company.country}
                options={countryOptions}
                onChange={(country) => setCompanyProfile({ ...companyProfile, country })}
              />
              <ThemedSelect
                label="Currency"
                value={companyProfile.currency ?? data?.company.currency}
                options={currencyOptions}
                onChange={(currency) => setCompanyProfile({ ...companyProfile, currency })}
              />
              <ThemedSelect
                label="Timezone"
                value={companyProfile.timezone ?? data?.company.timezone}
                options={timezoneOptions}
                onChange={(timezone) => setCompanyProfile({ ...companyProfile, timezone })}
              />
              <div>
                <label className="label">Registration number</label>
                <input
                  className="input"
                  value={companyProfile.registrationNumber ?? data?.company.registrationNumber ?? ""}
                  onChange={(event) =>
                    setCompanyProfile({ ...companyProfile, registrationNumber: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Tax ID</label>
                <input
                  className="input"
                  value={companyProfile.taxId ?? data?.company.taxId ?? ""}
                  onChange={(event) => setCompanyProfile({ ...companyProfile, taxId: event.target.value })}
                />
              </div>
              <div>
                <label className="label">Contact email</label>
                <input
                  type="email"
                  className="input"
                  value={companyProfile.email ?? data?.company.email ?? ""}
                  onChange={(event) => setCompanyProfile({ ...companyProfile, email: event.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={companyProfile.phone ?? data?.company.phone ?? ""}
                  onChange={(event) => setCompanyProfile({ ...companyProfile, phone: event.target.value })}
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  className="input"
                  value={companyProfile.website ?? data?.company.website ?? ""}
                  onChange={(event) => setCompanyProfile({ ...companyProfile, website: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Registered address</label>
              <textarea
                className="input !h-20 py-3"
                value={companyProfile.address ?? data?.company.address ?? ""}
                onChange={(event) => setCompanyProfile({ ...companyProfile, address: event.target.value })}
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" disabled={updateCompany.isPending}>
                Save company profile
              </button>
            </div>
          </form>
        </div>
        <SettingsCard
          title="Departments"
          icon={Building2}
          action={() => setModal("department")}
          items={data?.departments.map((item) => ({ title: item.name, detail: item.code })) ?? []}
        />
        <SettingsCard
          title="Job titles"
          icon={BriefcaseBusiness}
          action={() => setModal("title")}
          items={
            data?.jobTitles.map((item) => ({ title: item.name, detail: item.level || "No level" })) ?? []
          }
        />
        <div className="lg:col-span-2">
          <SettingsCard
            title="Custom roles"
            icon={ShieldCheck}
            action={() => setModal("role")}
            items={
              data?.roles.map((item) => ({
                title: item.name,
                detail: `${item.permissions.length} permissions`
              })) ?? []
            }
          />
        </div>
      </section>
      <SettingsDrawer
        open={Boolean(modal)}
        modal={modal}
        form={form}
        selectedPermissions={selectedPermissions}
        onClose={() => setModal(null)}
        onFormChange={(updates) => setForm({ ...form, ...updates })}
        onTogglePermission={(permission, enabled) =>
          setSelectedPermissions(
            enabled
              ? [...selectedPermissions, permission]
              : selectedPermissions.filter((item) => item !== permission)
          )
        }
        onSubmit={() => create.mutate()}
        isPending={create.isPending}
        error={create.error?.message}
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        timezoneOptions={timezoneOptions}
        permissions={permissions}
      />
    </div>
  );
}

function SettingsCard({
  title,
  icon: Icon,
  action,
  items
}: {
  title: string;
  icon: typeof Building2;
  action: () => void;
  items: Array<{ title: string; detail: string }>;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon size={18} />
          </span>
          <h2 className="font-display font-bold">{title}</h2>
        </div>
        <button className="btn-secondary !px-3 !py-2" onClick={action}>
          <Plus size={15} />
          Add
        </button>
      </div>
      <div className="mt-4 divide-y divide-line">
        {items.map((item) => (
          <div className="flex justify-between py-3" key={`${item.title}-${item.detail}`}>
            <span className="text-sm font-semibold">{item.title}</span>
            <span className="text-xs text-muted">{item.detail}</span>
          </div>
        ))}
        {!items.length && <p className="py-5 text-sm text-muted">Nothing here yet.</p>}
      </div>
    </div>
  );
}
