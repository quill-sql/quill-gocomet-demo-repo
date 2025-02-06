import { format } from "@quillsql/react";

export function formatRows(rows: any[], columns: any[]) {
  return rows.map((row) => {
    return columns.reduce((acc, column) => {
      const value = row[column.field];
      acc[column.field] = format({ value, format: column.format });
      return acc;
    }, {});
  });
}
