import { Users } from "lucide-react";

type EmptyProps = { title: string; text: string };

export function Empty({ title, text }: EmptyProps) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Users size={20} />
      </div>
      <h3 className="font-display font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
    </div>
  );
}
