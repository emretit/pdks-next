"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: number;
  name: string;
}

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deviceData, setDeviceData] = useState({
    name: "",
    device_id: "",
    location: "",
    device_type: "",
    status: "active",
    project_id: "",
  });
  const supabase = createClient();

  useEffect(() => {
    // Projeleri yükle
    const loadProjects = async () => {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("is_active", true);

      if (projectsData) {
        setProjects(projectsData);
      }
    };

    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceData.project_id) {
      alert("Lütfen bir proje seçin");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("devices").insert([
        {
          ...deviceData,
          project_id: parseInt(deviceData.project_id),
        },
      ]);

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
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Yeni Cihaz Ekle</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project">Proje</Label>
            <Select
              value={deviceData.project_id}
              onValueChange={(value) =>
                setDeviceData((prev) => ({ ...prev, project_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Proje seçin" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Cihaz Adı</Label>
            <Input
              id="name"
              value={deviceData.name}
              onChange={(e) =>
                setDeviceData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="device_id">Cihaz ID</Label>
            <Input
              id="device_id"
              value={deviceData.device_id}
              onChange={(e) =>
                setDeviceData((prev) => ({
                  ...prev,
                  device_id: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={deviceData.location}
              onChange={(e) =>
                setDeviceData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="device_type">Cihaz Tipi</Label>
            <Input
              id="device_type"
              value={deviceData.device_type}
              onChange={(e) =>
                setDeviceData((prev) => ({
                  ...prev,
                  device_type: e.target.value,
                }))
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ekleniyor..." : "Cihazı Ekle"}
          </Button>
        </form>
      </div>
    </div>
  );
}
