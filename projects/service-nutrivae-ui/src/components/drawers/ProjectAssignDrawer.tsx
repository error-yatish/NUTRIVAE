import { Drawer } from "../ui";
import { FormField } from "../";
import { ThemedSelect } from "../forms";

type AssignmentForm = {
  employeeId: string;
  role: string;
  allocation: string;
};

export function ProjectAssignDrawer({
  open,
  onClose,
  employees,
  assignmentForm,
  onChange,
  onSubmit,
  isPending
}: {
  open: boolean;
  onClose: () => void;
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  assignmentForm: AssignmentForm;
  onChange: (form: AssignmentForm) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Assign employee">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <ThemedSelect
          label="Employee"
          placeholder="Choose employee"
          value={assignmentForm.employeeId}
          options={[
            { value: "", label: "Choose employee" },
            ...employees.map((employee) => ({
              value: employee.id,
              label: `${employee.firstName} ${employee.lastName}`
            }))
          ]}
          onChange={(value) => onChange({ ...assignmentForm, employeeId: value })}
        />
        <div className="form-grid">
          <FormField
            label="Project role"
            value={assignmentForm.role}
            onChange={(event) => onChange({ ...assignmentForm, role: event.target.value })}
          />
          <FormField
            label="Allocation %"
            type="number"
            min={1}
            max={100}
            value={assignmentForm.allocation}
            onChange={(event) => onChange({ ...assignmentForm, allocation: event.target.value })}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={isPending}>
            Assign employee
          </button>
        </div>
      </form>
    </Drawer>
  );
}
