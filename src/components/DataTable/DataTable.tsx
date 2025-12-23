import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, MoreVertical, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

export type ColumnDef<T> = {
  accessorKey: keyof T | string;
  header: string;
  cell?: (row: T) => ReactNode;
  className?: string;
  width?: string;
};

export type FilterOption = {
  value: string;
  label: string;
};

export type Action<T> = {
  label: string;
  icon: ReactNode;
  onClick: (row: T) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: (row: T) => boolean;
};

export type SummaryStat = {
  label: string;
  value: number | string;
  color?: string;
  icon?: ReactNode;
  tooltip?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onValueChange: (value: string) => void;
    icon?: ReactNode;
  }[];
  actions?: Action<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;
  summaryStats?: SummaryStat[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  tableClassName?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onPageChange: (page: number) => void;
  };
  showClearFilters?: boolean;
  onClearFilters?: () => void;
  skeletonCount?: number;
  getRowActions?: (row: T) => Action<T>[];
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  actions = [],
  onAdd,
  addButtonLabel = "Add New",
  summaryStats = [],
  onRowClick,
  emptyMessage = "No data found",
  tableClassName = "",
  pagination,
  showClearFilters = false,
  onClearFilters,
  skeletonCount = 5,
  getRowActions,
}: DataTableProps<T>) {
  const renderCell = (row: T, column: ColumnDef<T>) => {
    if (column.cell) return column.cell(row);
    const value = row[column.accessorKey as keyof T];
    return value as ReactNode;
  };

  const hasAnyActions = actions.length > 0 || getRowActions !== undefined;

  const skeletonRows = Array.from({ length: skeletonCount }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      {columns.map((column) => (
        <TableCell key={`skeleton-${String(column.accessorKey)}-${index}`}>
          <div className="bg-muted h-6 animate-pulse rounded"></div>
        </TableCell>
      ))}
      {hasAnyActions && (
        <TableCell>
          <div className="flex justify-end">
            <div className="bg-muted h-8 w-8 animate-pulse rounded"></div>
          </div>
        </TableCell>
      )}
    </TableRow>
  ));

  return (
    <div className="text-foreground space-y-6">
      {/* Summary Stats */}
      {summaryStats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className="border-border bg-card rounded-lg border p-4 shadow-sm"
              title={stat.tooltip}
            >
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                {stat.icon && (
                  <div className="text-muted-foreground/60">{stat.icon}</div>
                )}
              </div>
              <p
                className={`text-2xl font-bold ${stat.color || "text-foreground"}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Header with search and filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background border-border pl-10"
            />
          </div>

          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.label}
                  value={filter.value}
                  onValueChange={filter.onValueChange}
                >
                  <SelectTrigger className="bg-background border-border w-[150px]">
                    <div className="flex items-center gap-2">
                      {filter.icon}
                      <span>{filter.label}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {showClearFilters && onClearFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="border-border h-10 gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {onAdd && (
          <Button
            className="bg-primary text-primary-foreground gap-2"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Table Container */}
      <div className="border-border bg-card rounded-md border">
        <Table className={tableClassName}>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={`text-muted-foreground font-semibold ${column.className}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasAnyActions && (
                <TableHead className="text-muted-foreground w-[100px] text-right font-semibold">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRows
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasAnyActions ? 1 : 0)}
                  className="text-muted-foreground py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="bg-muted rounded-full p-3">
                      <Search className="text-muted-foreground/60 h-6 w-6" />
                    </div>
                    <p className="text-foreground text-lg font-medium">
                      {emptyMessage}
                    </p>
                    {searchTerm && (
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowActions = getRowActions ? getRowActions(row) : actions;
                const hasRowActions = rowActions.length > 0;

                return (
                  <TableRow
                    key={index}
                    className={`border-border transition-colors ${
                      onRowClick
                        ? "hover:bg-muted/30 cursor-pointer"
                        : "hover:bg-muted/10"
                    }`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.accessorKey)}
                        className={`text-foreground ${column.className}`}
                      >
                        {renderCell(row, column)}
                      </TableCell>
                    ))}

                    {hasAnyActions && (
                      <TableCell className="text-right">
                        {hasRowActions ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-popover border-border"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {rowActions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                  className={
                                    action.variant === "destructive"
                                      ? "text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                      : "focus:bg-muted"
                                  }
                                  disabled={action.disabled?.(row)}
                                >
                                  <div className="flex items-center gap-2">
                                    {action.icon}
                                    {action.label}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="h-8 w-8"></div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-border bg-muted/20 flex items-center justify-between border-t px-4 py-4">
            <div className="text-muted-foreground text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      pagination.onPrevPage();
                    }}
                    className={
                      pagination.currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted cursor-pointer"
                    }
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="px-4 text-sm font-medium">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      pagination.onNextPage();
                    }}
                    className={
                      pagination.currentPage === pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
