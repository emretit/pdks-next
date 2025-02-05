import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DevicesPage() {
  const supabase = await createClient();

  const { data: devices, error } = await supabase
    .from("devices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Cihaz verileri yüklenirken hata oluştu: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cihaz Yönetimi</h1>
        <Button asChild>
          <Link href="/protected/devices/new">Yeni Cihaz Ekle</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={devices || []} />
    </div>
  );
}
