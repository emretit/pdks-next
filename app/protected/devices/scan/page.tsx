"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ServerDevice {
  id: number;
  name: string;
  ip_address: string;
  device_id: string;
  location: string;
  device_type: string;
  status: string;
}

export default function ScanDevicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [serverDevices, setServerDevices] = useState<ServerDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const supabase = createClient();

  const scanDevices = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase
        .from("server_devices")
        .select("*")
        .eq("status", "online");

      if (error) throw error;
      setServerDevices(data || []);
    } catch (error) {
      console.error("Cihazlar taranırken hata:", error);
      alert("Cihazlar taranırken bir hata oluştu.");
    } finally {
      setScanning(false);
    }
  };

  const handleDeviceSelect = (deviceId: number) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleAddDevices = async () => {
    setLoading(true);
    try {
      const selectedDeviceData = serverDevices.filter((device) =>
        selectedDevices.includes(device.id)
      );

      const devicesToAdd = selectedDeviceData.map((device) => ({
        name: device.name,
        ip_address: device.ip_address,
        location: device.location,
        model: device.device_type,
        serial_number: device.device_id,
        status: "active",
        device_id: device.device_id,
      }));

      const { error } = await supabase.from("devices").insert(devicesToAdd);

      if (error) throw error;

      router.push("/protected/devices");
      router.refresh();
    } catch (error) {
      console.error("Cihazlar eklenirken hata:", error);
      alert("Cihazlar eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Cihaz Tara</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button onClick={scanDevices} disabled={scanning}>
            {scanning ? "Taranıyor..." : "Cihazları Tara"}
          </Button>
          <Button
            onClick={handleAddDevices}
            disabled={loading || selectedDevices.length === 0}
          >
            {loading ? "Ekleniyor..." : "Seçili Cihazları Ekle"}
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Seç</TableHead>
                <TableHead>Cihaz Adı</TableHead>
                <TableHead>IP Adresi</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serverDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Henüz cihaz taraması yapılmadı.
                  </TableCell>
                </TableRow>
              ) : (
                serverDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDevices.includes(device.id)}
                        onCheckedChange={() => handleDeviceSelect(device.id)}
                      />
                    </TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.ip_address}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{device.device_type}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {device.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
