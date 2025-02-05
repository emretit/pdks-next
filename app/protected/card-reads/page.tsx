import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./data-table";
import { columns, CardRead } from "./columns";

export default async function CardReadsPage() {
  const supabase = await createClient();

  const { data: readings, error } = await supabase
    .from("card_readings")
    .select(
      `
      id,
      card_no,
      created_at,
      employee_name,
      status
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Sorgu hatası:", error); // Hatayı console'da görelim
    return <div>Veri yüklenirken hata oluştu: {error.message}</div>;
  }

  // employee_name zaten tabloda olduğu için dönüşüme gerek yok
  const formattedReadings = readings?.map((reading) => ({
    ...reading,
    employee_name: reading.employee_name || "Bilinmeyen Çalışan",
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Kart Okuma Kayıtları</h1>
      <DataTable columns={columns} data={formattedReadings || []} />
    </div>
  );
}
