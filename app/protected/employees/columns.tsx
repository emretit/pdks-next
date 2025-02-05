"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tc_no: string;
  card_number: string;
  company_id: number | null;
  department_id: number | null;
  position_id: number | null;
  access_permission: boolean;
  shift: string;
  photo_url: string | null;
  company?: string;
  department?: string;
  position?: string;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "first_name",
    header: "Ad",
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string;
      return <span>{firstName || "Belirtilmemiş"}</span>;
    },
  },
  {
    accessorKey: "last_name",
    header: "Soyad",
    cell: ({ row }) => {
      const lastName = row.getValue("last_name") as string;
      return <span>{lastName || "Belirtilmemiş"}</span>;
    },
  },
  {
    accessorKey: "email",
    header: "E-posta",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <span>{email || "Belirtilmemiş"}</span>;
    },
  },
  {
    accessorKey: "access_permission",
    header: "Erişim İzni",
    cell: ({ row }) => {
      const permission = row.getValue("access_permission");
      return <span>{permission ? "Evet" : "Hayır"}</span>;
    },
  },
  {
    accessorKey: "tc_no",
    header: "TC No",
    cell: ({ row }) => {
      const tcNo = row.getValue("tc_no") as string;
      return <span>{tcNo ? tcNo.replace(/\s+/g, "") : "Belirtilmemiş"}</span>;
    },
  },
  {
    accessorKey: "card_number",
    header: "Kart Numarası",
    cell: ({ row }) => {
      const cardNumber = row.getValue("card_number") as string;
      return <span className="font-mono">{cardNumber || "Belirtilmemiş"}</span>;
    },
  },
  {
    accessorKey: "photo_url",
    header: "Fotoğraf",
    cell: ({ row }) => {
      const url = row.getValue("photo_url") as string;
      return url ? (
        <img
          src={url}
          alt="Profil"
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "shift",
    header: "Vardiya",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const router = useRouter();
      const supabase = createClient();
      const employee = row.original;
      const onDelete = table.options.meta?.onDelete;

      const handleDelete = async () => {
        try {
          const { error } = await supabase
            .from("employees")
            .delete()
            .eq("id", employee.id);

          if (error) {
            console.error("Çalışan silinirken hata:", error.message);
            alert("Çalışan silinirken bir hata oluştu: " + error.message);
            return;
          }

          if (onDelete) {
            onDelete();
          }
        } catch (error: any) {
          console.error("Beklenmeyen hata:", error);
          alert("Beklenmeyen bir hata oluştu: " + error.message);
        }
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/protected/employees/edit?id=${employee.id}`)
            }
          >
            Düzenle
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Çalışanı Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  {employee.first_name} {employee.last_name} isimli çalışanı
                  silmek istediğinizden emin misiniz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
