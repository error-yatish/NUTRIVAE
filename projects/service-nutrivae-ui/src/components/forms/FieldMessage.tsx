export interface FieldMessageProps {
  error?: string;
  description?: string;
}

export function FieldMessage({ error, description }: FieldMessageProps) {
  if (error) {
    return <p className="field-error">{error}</p>;
  }

  return description ? <p className="mt-1 text-xs text-muted">{description}</p> : null;
}
