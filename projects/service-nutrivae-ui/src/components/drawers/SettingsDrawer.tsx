import { Drawer } from "..";
import { ThemedSelect } from "../forms";

type SettingsDrawerProps = {
  open: boolean;
  modal: "department" | "title" | "role" | "company" | null;
  form: Record<string, string>;
  selectedPermissions: string[];
  onClose: () => void;
  onFormChange: (updates: Record<string, string>) => void;
  onTogglePermission: (permission: string, enabled: boolean) => void;
  onSubmit: () => void;
  isPending: boolean;
  error?: string;
  countryOptions: Array<{ value: string; label: string }>;
  currencyOptions: Array<{ value: string; label: string }>;
  timezoneOptions: Array<{ value: string; label: string }>;
  permissions: Array<[string, string]>;
};

export function SettingsDrawer({
  open,
  onClose,
  modal,
  form,
  selectedPermissions,
  onFormChange,
  onTogglePermission,
  onSubmit,
  isPending,
  error,
  countryOptions,
  currencyOptions,
  timezoneOptions,
  permissions
}: SettingsDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title={`Create ${modal ?? ""}`}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="label">Name</label>
          <input
            required
            className="input"
            value={form.name ?? ""}
            onChange={(event) => onFormChange({ ...form, name: event.target.value })}
          />
        </div>
        {modal === "department" && (
          <div>
            <label className="label">Code</label>
            <input
              required
              className="input"
              maxLength={10}
              value={form.code ?? ""}
              onChange={(event) => onFormChange({ ...form, code: event.target.value })}
            />
          </div>
        )}
        {modal === "title" && (
          <div>
            <label className="label">Level</label>
            <input
              className="input"
              placeholder="e.g. L4"
              value={form.level ?? ""}
              onChange={(event) => onFormChange({ ...form, level: event.target.value })}
            />
          </div>
        )}
        {modal === "company" && (
          <>
            <div>
              <label className="label">Workspace slug</label>
              <input
                required
                className="input"
                placeholder="acme-inc"
                value={form.slug ?? ""}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  })
                }
              />
            </div>
            <div>
              <ThemedSelect
                label="Country"
                value={form.country ?? "United States"}
                options={countryOptions}
                onChange={(country) => onFormChange({ ...form, country })}
              />
            </div>
            <ThemedSelect
              label="Currency"
              value={form.currency ?? "USD"}
              options={currencyOptions}
              onChange={(currency) => onFormChange({ ...form, currency })}
            />
            <ThemedSelect
              label="Timezone"
              value={form.timezone ?? "America/New_York"}
              options={timezoneOptions}
              onChange={(timezone) => onFormChange({ ...form, timezone })}
            />
            <div>
              <label className="label">Legal name</label>
              <input
                className="input"
                value={form.legalName ?? ""}
                onChange={(event) => onFormChange({ ...form, legalName: event.target.value })}
              />
            </div>
            <div>
              <label className="label">Contact email</label>
              <input
                type="email"
                className="input"
                value={form.email ?? ""}
                onChange={(event) => onFormChange({ ...form, email: event.target.value })}
              />
            </div>
          </>
        )}
        {modal === "role" && (
          <>
            <div>
              <label className="label">Description</label>
              <input
                className="input"
                value={form.description ?? ""}
                onChange={(event) => onFormChange({ ...form, description: event.target.value })}
              />
            </div>
            <div>
              <label className="label">Permissions</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {permissions.map(([value, label]) => (
                  <label
                    className="flex items-center gap-2 rounded-xl border border-line p-3 text-sm"
                    key={value}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(value)}
                      onChange={(event) => onTogglePermission(value, event.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={isPending}>
            Create
          </button>
        </div>
      </form>
    </Drawer>
  );
}
