"use client";

import { ColumnDef } from "@tanstack/react-table";

export type CardRead = {
  id: number;
  card_no: string;
  created_at: string;
  employee_name: string | null;
  status: string;
  employees?: {
    first_name: string;
    last_name: string;
  }[];
};

export const columns: ColumnDef<CardRead>[] = [
  {
    accessorKey: "card_no",
    header: "Kart Numarası",
  },
  {
    accessorKey: "employee_name",
    header: "Çalışan Adı",
    cell: ({ row }) => {
      return row.original.employee_name || "Bilinmeyen Çalışan";
    },
  },
  {
    accessorKey: "device.name",
    header: "Cihaz Adı",
  },
  {
    accessorKey: "device.location",
    header: "Konum",
  },
  {
    accessorKey: "created_at",
    header: "Okuma Zamanı",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
];
