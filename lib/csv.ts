function escapeCsvCell(value: string) {
  let safe = value.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(safe)) {
    safe = `'${safe}`;
  }
  return `"${safe}"`;
}

export function buildCsv(header: string[], rows: string[][]) {
  const csvLines = [
    header.map((value) => escapeCsvCell(value)).join(","),
    ...rows.map((row) => row.map((value) => escapeCsvCell(value)).join(",")),
  ];

  return `\uFEFF${csvLines.join("\n")}`;
}
