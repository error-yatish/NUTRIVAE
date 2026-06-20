import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { FieldMessage, type FieldMessageProps } from "./FieldMessage";

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">, FieldMessageProps {
  label: string;
  className?: string;
  selectClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, description, children, className, selectClassName, id, ...props },
  ref
) {
  const selectId = id ?? props.name;

  return (
    <div className={className}>
      <label className="label" htmlFor={selectId}>
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`input appearance-none pr-10 ${selectClassName ?? ""}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      <FieldMessage error={error} description={description} />
    </div>
  );
});
