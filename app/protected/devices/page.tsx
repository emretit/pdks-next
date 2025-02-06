"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

interface ServerDevice {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  last_seen: string;
}

interface DeviceFormData {
  location: string;
  model: string;
  serial_number: string;
  device_id: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanTable, setShowScanTable] = useState(false);
  const [serverDevices, setServerDevices] = useState<ServerDevice[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<ServerDevice | null>(
    null
  );
  const [deviceFormData, setDeviceFormData] = useState<DeviceFormData>({
    location: "",
    model: "",
    serial_number: "",
    device_id: "",
  });
  const supabase = createClient();

  const fetchDevices = async () => {
    const { data } = await supabase.from("devices").select("*");
    setDevices(data || []);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const scanDevices = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase
        .from("server_devices")
        .select("*")
        .eq("status", "online");

      if (error) throw error;
      setServerDevices(data || []);
      setShowScanTable(true);
    } catch (error) {
      console.error("Cihazlar taranırken hata:", error);
      toast.error("Cihazlar taranırken bir hata oluştu");
    } finally {
      setScanning(false);
    }
  };

  const handleDeviceSelect = (device: ServerDevice) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
    // Cihaz ID'sini otomatik oluştur
    setDeviceFormData((prev) => ({
      ...prev,
      device_id: `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  };

  const handleAddDevice = async (formData: DeviceFormData) => {
    if (!selectedDevice) {
      toast.error("Seçili cihaz bulunamadı");
      return;
    }

    try {
      // Önce Supabase bağlantısını kontrol et
      const { data: testConnection, error: connectionError } = await supabase
        .from("devices")
        .select("*")
        .limit(1);
      if (connectionError) {
        console.error("Supabase bağlantı hatası:", connectionError);
        toast.error("Veritabanı bağlantısı kurulamadı");
        return;
      }

      // Eklenecek veriyi hazırla
      const deviceToAdd = {
        name: selectedDevice.name || `Cihaz-${selectedDevice.ip_address}`,
        ip_address: selectedDevice.ip_address,
        location: formData.location,
        status: selectedDevice.status || "online",
        device_id: formData.device_id,
        host_address: selectedDevice.ip_address,
        protocol: "tcp",
        device_ssl: "none",
        last_seen: selectedDevice.last_seen || new Date().toISOString(),
        server_device_id: selectedDevice.id, // Yeni eklenen ilişki
      };

      console.log("Eklenecek veri:", JSON.stringify(deviceToAdd, null, 2));

      // Veriyi ekle
      const { data, error } = await supabase
        .from("devices")
        .insert([deviceToAdd])
        .select("*");

      if (error) {
        throw new Error(
          JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          })
        );
      }

      console.log("Eklenen veri:", data);
      toast.success("Cihaz başarıyla eklendi");
      setShowDeviceModal(false);
      fetchDevices();

      setDeviceFormData({
        location: "",
        model: "",
        serial_number: "",
        device_id: "",
      });
    } catch (error: any) {
      const errorMessage = error?.message ? JSON.parse(error.message) : error;
      console.error("Tam hata:", errorMessage);
      toast.error(`Hata: ${errorMessage?.message || "Bilinmeyen hata"}`);
    }
  };

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cihaz Yönetimi</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={scanDevices} disabled={scanning}>
            {scanning ? "Taranıyor..." : "Cihaz Tara"}
          </Button>
          <Button asChild>
            <Link href="/protected/devices/new">Yeni Cihaz Ekle</Link>
          </Button>
        </div>
      </div>

      {showScanTable && (
        <Card className="mb-6">
          <CardContent>
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
                {serverDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.ip_address}</TableCell>
                    <TableCell>
                      {device.name || `Cihaz-${device.ip_address}`}
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
                      {device.last_seen
                        ? formatLastSeen(device.last_seen)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleDeviceSelect(device)}>
                        Ekle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeviceModal} onOpenChange={setShowDeviceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cihaz Bilgilerini Tamamlayın</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddDevice(deviceFormData);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label>Konum</Label>
                <Input
                  required
                  value={deviceFormData.location}
                  onChange={(e) =>
                    setDeviceFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Model</Label>
                <Input
                  required
                  value={deviceFormData.model}
                  onChange={(e) =>
                    setDeviceFormData((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Seri Numarası</Label>
                <Input
                  required
                  value={deviceFormData.serial_number}
                  onChange={(e) =>
                    setDeviceFormData((prev) => ({
                      ...prev,
                      serial_number: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Cihaz ID</Label>
                <Input
                  required
                  value={deviceFormData.device_id}
                  onChange={(e) =>
                    setDeviceFormData((prev) => ({
                      ...prev,
                      device_id: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeviceModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Ekle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable columns={columns} data={devices} />
    </div>
  );
}
