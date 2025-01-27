import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Çalışanlar yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Çalışanlar</h1>
      <DataTable columns={columns} data={employees} />
    </div>
  );
}
