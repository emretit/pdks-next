"use client";
import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [realTimeData, setRealTimeData] = useState(data);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime-card-readings")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "card_readings",
        },
        async (payload) => {
          const { data: newRecord } = await supabase
            .from("card_readings")
            .select(
              `
              id,
              card_no,
              created_at,
              employee_name,
              status,
              device:devices!card_readings_device_id_fkey(name, location),
              employee:employees!fk_card_readings_card_no(first_name, last_name)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newRecord) {
            setRealTimeData((prev) => [newRecord as TData, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const table = useReactTable({
    data: realTimeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Henüz okuma kaydı bulunmamaktadır
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
