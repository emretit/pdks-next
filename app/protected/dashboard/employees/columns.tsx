"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tc_no: string;
  card_number: string;
  company: string;
  department: string;
  position: string;
  shift: string;
  access_permission: boolean;
  photo_url: string | null;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "first_name",
    header: "Ad",
  },
  {
    accessorKey: "last_name",
    header: "Soyad",
  },
  {
    accessorKey: "email",
    header: "E-posta",
  },
  {
    accessorKey: "company",
    header: "Şirket",
  },
  {
    accessorKey: "department",
    header: "Departman",
  },
  {
    accessorKey: "position",
    header: "Pozisyon",
  },
  {
    accessorKey: "access_permission",
    header: "Erişim İzni",
    cell: ({ row }) => {
      const permission = row.getValue("access_permission");
      return <span>{permission ? "Evet" : "Hayır"}</span>;
    },
  },
];
