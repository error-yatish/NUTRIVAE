import { forwardRef, type InputHTMLAttributes } from "react";
import { FieldMessage, type FieldMessageProps } from "./FieldMessage";

export interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className">, FieldMessageProps {
  label: string;
  className?: string;
  inputClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, description, className, inputClassName, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <input ref={ref} id={inputId} className={`input ${inputClassName ?? ""}`} {...props} />
      <FieldMessage error={error} description={description} />
    </div>
  );
});
