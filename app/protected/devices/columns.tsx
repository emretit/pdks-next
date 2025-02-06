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
  device_id: string;
  host_address: string;
  protocol: string;
  device_ssl: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
  server_device_id: number;
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
      const isOnline = row.original.last_seen
        ? new Date().getTime() - new Date(row.original.last_seen).getTime() <
          30000 // Son 30 saniye içinde
        : false;

      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
          />
          <span>{isOnline ? "Çevrimiçi" : "Çevrimdışı"}</span>
        </div>
      );
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
  {
    accessorKey: "last_seen",
    header: "Son Görülme",
    cell: ({ row }) => {
      const last_seen = row.getValue("last_seen");
      if (!last_seen) return "Hiç bağlanmadı";

      return new Date(last_seen as string).toLocaleString("tr-TR");
    },
  },
];
