import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./data-table";
import { columns, CardRead } from "./columns";

export default async function CardReadsPage() {
  const supabase = await createClient();

  try {
    const { data: readings, error } = await supabase
      .from("card_readings")
      .select(
        `
        id,
        card_no,
        created_at,
        employee_name,
        status,
        device_id,
        server_device:server_devices(name, ip_address)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Sorgu hatası:", error);
      return <div>Veri yüklenirken hata oluştu: {error.message}</div>;
    }

    const formattedReadings = readings?.map((reading) => ({
      ...reading,
      employee_name: reading.employee_name || "Bilinmeyen Çalışan",
      device: reading.server_device
        ? {
            name:
              reading.server_device.name ||
              `Cihaz-${reading.server_device.ip_address}`,
            location: reading.server_device.ip_address,
          }
        : null,
    }));

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Kart Okuma Kayıtları</h1>
        <DataTable columns={columns} data={formattedReadings || []} />
      </div>
    );
  } catch (error: any) {
    console.error("Beklenmeyen hata:", error);
    return <div>Beklenmeyen bir hata oluştu: {error.message}</div>;
  }
}
