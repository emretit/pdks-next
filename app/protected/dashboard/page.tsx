import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Smartphone,
  DoorOpen,
  ClipboardList,
  Settings,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verileri çek
  const { count: devicesCount, error: devicesError } = await supabase
    .from("devices")
    .select("*", { count: "exact", head: true });

  const { count: employeesCount, error: employeesError } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true });

  if (devicesError || employeesError) {
    return <div>Veriler yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Ana Sayfa</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Çalışanlar */}
        <Link href="/protected/employees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Çalışanlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{employeesCount || 0}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Cihazlar */}
        <Link href="/protected/devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Cihazlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{devicesCount || 0}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Geçiş Kontrol */}
        <Link href="/protected/access-controls">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                Geçiş Kontrol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Geçiş kayıtlarını görüntüle
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* PDKS Yönetimi */}
        <Link href="/protected/pdks-management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                PDKS Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">PDKS ayarlarını yönet</p>
            </CardContent>
          </Card>
        </Link>

        {/* Yönetim Paneli */}
        <Link href="/protected/admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Yönetim Paneli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Sistem ayarlarını yönet</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
