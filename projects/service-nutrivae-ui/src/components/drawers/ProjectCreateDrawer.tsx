import { Drawer } from "..";
import { FormField, TextAreaField, ThemedSelect } from "../forms";

type ProjectForm = {
  name: string;
  code: string;
  description: string;
  clientName: string;
  status: string;
};

export function ProjectCreateDrawer({
  open,
  onClose,
  projectForm,
  onChange,
  onSubmit,
  isPending
}: {
  open: boolean;
  onClose: () => void;
  projectForm: ProjectForm;
  onChange: (form: ProjectForm) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Create project">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-grid">
          <FormField
            label="Project name"
            required
            value={projectForm.name}
            onChange={(event) => onChange({ ...projectForm, name: event.target.value })}
          />
          <FormField
            label="Project code"
            required
            value={projectForm.code}
            onChange={(event) => onChange({ ...projectForm, code: event.target.value.toUpperCase() })}
          />
        </div>
        <FormField
          label="Client"
          value={projectForm.clientName}
          onChange={(event) => onChange({ ...projectForm, clientName: event.target.value })}
        />
        <TextAreaField
          label="Description"
          value={projectForm.description}
          onChange={(event) => onChange({ ...projectForm, description: event.target.value })}
        />
        <ThemedSelect
          label="Status"
          placeholder="Choose status"
          value={projectForm.status}
          options={[
            { value: "PLANNED", label: "Planned" },
            { value: "ACTIVE", label: "Active" },
            { value: "ON_HOLD", label: "On hold" },
            { value: "COMPLETED", label: "Completed" }
          ]}
          onChange={(value) => onChange({ ...projectForm, status: value })}
        />
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={isPending}>
            Create project
          </button>
        </div>
      </form>
    </Drawer>
  );
}
