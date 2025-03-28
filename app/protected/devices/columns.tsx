"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type Device = {
  id: number | string;
  name: string;
  device_id: string;
  location: string;
  status: string;
  device_type: string;
  last_seen: string;
  server_device?: {
    id: number;
    name: string;
    ip_address: string;
    status: string;
    last_seen: string;
  };
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
    accessorKey: "device_id",
    header: "Cihaz ID",
  },
  {
    accessorKey: "location",
    header: "Konum",
  },
  {
    accessorKey: "device_type",
    header: "Cihaz Tipi",
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const isOnline = row.original.server_device
        ? row.original.server_device.status === "online"
        : row.getValue("status") === "active";

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
    accessorKey: "last_seen",
    header: "Son Görülme",
    cell: ({ row }) => {
      const last_seen = row.original.server_device
        ? row.original.server_device.last_seen
        : row.getValue("last_seen");

      if (!last_seen) return "Hiç bağlanmadı";

      const date = new Date(last_seen);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return "Az önce";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} dakika önce`;
      } else {
        return date.toLocaleString("tr-TR");
      }
    },
  },
  {
    accessorKey: "connection_type",
    header: "Bağlantı Tipi",
    cell: ({ row }) => {
      return row.original.server_device ? "API Bağlantılı" : "Manuel Eklenen";
    },
  },
];
