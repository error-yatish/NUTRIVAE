import { forwardRef, type TextareaHTMLAttributes } from "react";
import { FieldMessage, type FieldMessageProps } from "./FieldMessage";

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">, FieldMessageProps {
  label: string;
  className?: string;
  textAreaClassName?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, error, description, className, textAreaClassName, id, ...props },
  ref
) {
  const textAreaId = id ?? props.name;

  return (
    <div className={className}>
      <label className="label" htmlFor={textAreaId}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={textAreaId}
        className={`input !h-24 py-3 ${textAreaClassName ?? ""}`}
        {...props}
      />
      <FieldMessage error={error} description={description} />
    </div>
  );
});
