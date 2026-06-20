import { Avatar, Modal } from "../ui";

type Employee = {
  firstName: string;
  lastName: string;
  workEmail: string;
  employeeNumber: string;
  department?: { name: string };
  jobTitle?: { name: string };
  status: string;
};

export function EmployeeProfileDrawer({
  open,
  onClose,
  employee
}: {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Employee profile">
      {employee ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={`${employee.firstName} ${employee.lastName}`} size="lg" />
            <div>
              <h3 className="font-display text-xl font-bold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-muted">{employee.jobTitle?.name ?? "No job title"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-canvas p-4 text-sm">
            <div>
              <span className="block text-xs text-muted">Email</span>
              {employee.workEmail}
            </div>
            <div>
              <span className="block text-xs text-muted">Employee ID</span>
              {employee.employeeNumber}
            </div>
            <div>
              <span className="block text-xs text-muted">Department</span>
              {employee.department?.name ?? "—"}
            </div>
            <div>
              <span className="block text-xs text-muted">Status</span>
              {employee.status.replace("_", " ")}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">No employee selected.</p>
      )}
    </Drawer>
  );
}
