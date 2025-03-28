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
              device_id,
              server_device:server_devices(name, ip_address)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newRecord) {
            const formattedRecord = {
              ...newRecord,
              device: newRecord.server_device
                ? {
                    name:
                      newRecord.server_device.name ||
                      `Cihaz-${newRecord.server_device.ip_address}`,
                    location: newRecord.server_device.ip_address,
                  }
                : null,
            };
            setRealTimeData((prev) => [formattedRecord as TData, ...prev]);
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
