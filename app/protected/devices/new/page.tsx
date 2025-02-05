"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    location: "",
    model: "",
    serial_number: "",
    status: "active",
    device_id: "", // Cihazın benzersiz kimliği
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("devices").insert([formData]);

      if (error) throw error;

      router.push("/protected/devices");
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
      <h1 className="text-2xl font-bold mb-6">Yeni Cihaz Ekle</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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
          <Label htmlFor="device_id">Cihaz ID</Label>
          <Input
            id="device_id"
            name="device_id"
            value={formData.device_id}
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
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="serial_number">Seri No</Label>
          <Input
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/protected/devices")}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
