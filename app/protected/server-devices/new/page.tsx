"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewServerDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    location: "",
    device_type: "",
    firmware_version: "",
    host_address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Benzersiz device_id ve secret_key oluştur
      const device_id = `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const secret_key = Math.random().toString(36).substr(2, 15);

      const { error } = await supabase.from("server_devices").insert([
        {
          ...formData,
          device_id,
          secret_key,
          status: "offline",
        },
      ]);

      if (error) throw error;

      router.push("/protected/server-devices");
      router.refresh();
    } catch (error) {
      console.error("Cihaz eklenirken hata:", error);
      alert("Cihaz eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto bg-background shadow rounded-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/server-devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Yeni Sunucu Cihazı Ekle</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Cihaz Adı</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="ip_address">IP Adresi</Label>
            <Input
              id="ip_address"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="device_type">Cihaz Tipi</Label>
            <Input
              id="device_type"
              name="device_type"
              value={formData.device_type}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="firmware_version">Yazılım Versiyonu</Label>
            <Input
              id="firmware_version"
              name="firmware_version"
              value={formData.firmware_version}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="host_address">Host Adresi</Label>
            <Input
              id="host_address"
              name="host_address"
              value={formData.host_address}
              onChange={handleChange}
              placeholder="http://2.168.0.25:3000/api/check-access"
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/protected/server-devices")}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
