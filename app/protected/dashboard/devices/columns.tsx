"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type Device = {
  id: number;
  name: string;
  ip_address: string;
  location: string;
  status: string;
  created_at: string;
  serial_number: string;
  model: string;
  protocol: string;
  device_ssl: string;
  host_address: string;
  updated_at: string;
};

export const columns: ColumnDef<Device>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cihaz Adı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "ip_address",
    header: "IP Adresi",
  },
  {
    accessorKey: "location",
    header: "Konum",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "serial_number",
    header: "Seri No",
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const statusMap: Record<string, string> = {
        active: "🟢 Aktif",
        inactive: "🔴 Pasif",
        maintenance: "🟡 Bakımda",
      };
      return <span>{statusMap[status as string] ?? status}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Kayıt Tarihi",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString("tr-TR");
    },
  },
];
