"use client";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { exportCSV, exportExcel, exportJSON } from "@/lib/export";
import type { DatasetRow } from "@/lib/types";

export function ExportMenu({ rows, name, count }: { rows: DatasetRow[]; name: string; count: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <Download className="h-3.5 w-3.5" /> Export{count ? ` (${count})` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportCSV(rows, name)}>
          <FileText className="h-3.5 w-3.5" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportJSON(rows, name)}>
          <FileJson className="h-3.5 w-3.5" /> JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportExcel(rows, name)}>
          <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
