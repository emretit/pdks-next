"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function ServerDevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data, error } = await supabase
          .from("server_devices")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDevices(data || []);
      } catch (error) {
        console.error("Cihazlar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    // Realtime subscription
    const channel = supabase
      .channel("server_devices_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "server_devices",
        },
        () => {
          fetchDevices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sunucu Cihazları</h1>
        <Link href="/protected/server-devices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Cihaz Ekle
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={devices} loading={loading} />
    </div>
  );
}
