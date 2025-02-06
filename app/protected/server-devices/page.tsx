"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface ServerDevice {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  last_seen: string;
}

export default function ServerDevicesPage() {
  const [devices, setDevices] = useState<ServerDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<{ [key: number]: string }>({});
  const supabase = createClient();

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from("server_devices")
        .select("*")
        .order("last_seen", { ascending: false });

      if (error) throw error;

      setDevices(data || []);

      // İlk yüklemede mevcut isimleri editing state'e aktar
      const initialEditingState: { [key: number]: string } = {};
      data?.forEach((device: ServerDevice) => {
        initialEditingState[device.id] =
          device.name || `Cihaz-${device.ip_address}`;
      });
      setEditingName(initialEditingState);
    } catch (error) {
      console.error("Cihazlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNameChange = (deviceId: number, newName: string) => {
    setEditingName((prev) => ({
      ...prev,
      [deviceId]: newName,
    }));
  };

  const handleNameSave = async (deviceId: number) => {
    try {
      const { error } = await supabase
        .from("server_devices")
        .update({ name: editingName[deviceId] })
        .eq("id", deviceId);

      if (error) throw error;
      fetchDevices();
    } catch (error) {
      console.error("İsim güncellenirken hata:", error);
    }
  };

  // Son görülme zamanını formatlayan fonksiyon
  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">Yükleniyor...</div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sunucu Cihazları</h1>
        <Button onClick={() => fetchDevices()}>Yenile</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Adresi</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Görülme</TableHead>
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.ip_address}</TableCell>
                  <TableCell>
                    <Input
                      value={editingName[device.id] || ""}
                      onChange={(e) =>
                        handleNameChange(device.id, e.target.value)
                      }
                      placeholder="Cihaz adı girin"
                    />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        device.status === "online"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {device.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {device.last_seen ? formatLastSeen(device.last_seen) : "-"}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleNameSave(device.id)} size="sm">
                      Kaydet
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
