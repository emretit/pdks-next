"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function NewServerDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    status: "offline",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("server_devices")
        .insert([formData]);

      if (error) throw error;
      router.push("/protected/server-devices");
    } catch (error) {
      console.error("Cihaz eklenirken hata:", error);
      alert("Cihaz eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/protected/server-devices">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Yeni Sunucu Cihazı Ekle</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Cihaz Adı</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Adresi</Label>
            <Input
              id="ip_address"
              value={formData.ip_address}
              onChange={(e) =>
                setFormData({ ...formData, ip_address: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Ekleniyor..." : "Cihaz Ekle"}
          </Button>
        </form>
      </div>
    </div>
  );
}
