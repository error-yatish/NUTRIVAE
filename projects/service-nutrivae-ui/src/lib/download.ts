export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number | null | undefined>>
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
