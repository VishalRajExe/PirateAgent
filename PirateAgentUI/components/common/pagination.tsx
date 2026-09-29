"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  itemName?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "items",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Generate page numbers array with ellipses if needed
  const pageNumbers: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("...");
    const pStart = Math.max(2, page - 1);
    const pEnd = Math.min(totalPages - 1, page + 1);
    for (let i = pStart; i <= pEnd; i++) {
      if (!pageNumbers.includes(i)) pageNumbers.push(i);
    }
    if (page < totalPages - 2) pageNumbers.push("...");
    if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60 text-[13px] text-muted-foreground select-none">
      <div>
        Showing <span className="font-semibold text-foreground">{start}</span>–
        <span className="font-semibold text-foreground">{end}</span> of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2.5 text-xs font-medium border-border/80 bg-card hover:bg-surface disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-muted-foreground text-xs">
                  …
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <Button
                key={`page-${p}`}
                variant={isCurrent ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(Number(p))}
                className={`h-8 w-8 p-0 text-xs font-semibold ${
                  isCurrent
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover border border-primary/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2.5 text-xs font-medium border-border/80 bg-card hover:bg-surface disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
