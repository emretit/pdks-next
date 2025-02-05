"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function NewEmployeePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string>("");
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    tc_no: "",
    card_number: "",
    shift: "",
    access_permission: true,
  });

  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id")
          .order("id", { ascending: false })
          .limit(1);

        if (error) throw error;

        const nextIdValue =
          data && data.length > 0 ? (data[0].id + 1).toString() : "1";
        setNextId(nextIdValue);
        setFormData((prev) => ({ ...prev, id: nextIdValue }));
      } catch (err: any) {
        console.error("ID alınırken hata:", err);
        setError(err.message);
      }
    };

    fetchNextId();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      access_permission: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from("employees")
        .insert([formData]);

      if (supabaseError) throw supabaseError;

      router.push("/protected/employees");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto bg-background shadow rounded-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Yeni Çalışan Ekle</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              name="id"
              value={nextId}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_name">Ad</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Soyad</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tc_no">TC Kimlik No</Label>
            <Input
              id="tc_no"
              name="tc_no"
              value={formData.tc_no}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card_number">Kart Numarası</Label>
            <Input
              id="card_number"
              name="card_number"
              value={formData.card_number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Vardiya</Label>
            <Input
              id="shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="access_permission"
                checked={formData.access_permission}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="access_permission">Erişim İzni</Label>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/protected/employees")}
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
