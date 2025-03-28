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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Project {
  id: number;
  name: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
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
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id.toString());
        }
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchDevices();
    }
  }, [selectedProject]);

  const fetchDevices = async () => {
    try {
      // Hem devices tablosundan hem de server_devices tablosundan veri çek
      const { data: devicesData, error: devicesError } = await supabase
        .from("devices")
        .select(
          `
          *,
          server_device:server_devices(
            id,
            name,
            ip_address,
            status,
            last_seen
          )
        `
        )
        .eq("project_id", parseInt(selectedProject))
        .order("created_at", { ascending: false });

      if (devicesError) throw devicesError;

      // API bağlantılı cihazları da kontrol et
      const { data: serverDevices, error: serverError } = await supabase
        .from("server_devices")
        .select("*")
        .eq("status", "online");

      if (serverError) throw serverError;

      // Tüm cihazları birleştir
      const allDevices = devicesData || [];

      // API bağlantılı cihazları ekle (eğer devices tablosunda yoksa)
      serverDevices?.forEach((serverDevice) => {
        const existingDevice = allDevices.find(
          (device) => device.server_device?.id === serverDevice.id
        );

        if (!existingDevice) {
          allDevices.push({
            id: `server-${serverDevice.id}`,
            name: serverDevice.name || `Cihaz-${serverDevice.ip_address}`,
            device_id: `API-${serverDevice.id}`,
            location: "API Bağlantılı",
            status: serverDevice.status,
            device_type: "API Cihazı",
            last_seen: serverDevice.last_seen,
            project_id: parseInt(selectedProject),
            server_device: serverDevice,
          });
        }
      });

      setDevices(allDevices);
    } catch (error) {
      console.error("Cihazlar yüklenirken hata:", error);
      toast.error("Cihazlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Gerçek zamanlı güncellemeler için subscription
  useEffect(() => {
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
  }, [selectedProject]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cihaz Yönetimi</h1>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
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
        <Button asChild>
          <Link href="/protected/devices/scan">Yeni Cihaz Ekle</Link>
        </Button>
      </div>

      <DataTable columns={columns} data={devices} />
    </div>
  );
}
