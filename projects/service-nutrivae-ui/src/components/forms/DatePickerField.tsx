import { DatePicker, type DatePickerProps } from "./DatePicker";
import { FieldMessage, type FieldMessageProps } from "./FieldMessage";

export interface DatePickerFieldProps extends Omit<DatePickerProps, "className">, FieldMessageProps {
  label: string;
  className?: string;
}

export function DatePickerField({
  label,
  error,
  description,
  className,
  ...datePickerProps
}: DatePickerFieldProps) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      <DatePicker {...datePickerProps} />
      <FieldMessage error={error} description={description} />
    </div>
  );
}
