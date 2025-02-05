"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";

export default function EmployeesPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        const mergedData = data.map((emp) => ({
          ...emp,
          first_name: emp.first_name || "Belirtilmemiş",
          last_name: emp.last_name || "Belirtilmemiş",
          email: emp.email || "Belirtilmemiş",
          tc_no: emp.tc_no || "Belirtilmemiş",
          card_number: emp.card_number
            ? emp.card_number.trim().toUpperCase()
            : "ATANMAMIŞ",
        }));

        setEmployees(mergedData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [supabase, refresh]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.tc_no.includes(searchTerm) ||
        employee.card_number.includes(searchTerm)
      );
    });
  }, [employees, searchTerm]);

  return (
    <div className="h-full bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="bg-background rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Çalışanlar</h1>
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
              >
                <Link
                  href="/protected/employees/new"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Çalışan Ekle
                </Link>
              </Button>
            </div>

            <div className="mt-4">
              <Input
                placeholder="Çalışan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredEmployees}
              loading={loading}
              onDelete={() => setRefresh((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
