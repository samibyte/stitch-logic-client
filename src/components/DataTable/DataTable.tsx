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
  // Data
  data: T[];
  columns: ColumnDef<T>[];

  // Loading
  isLoading: boolean;

  // Search & Filters
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

  // Actions
  actions?: Action<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;

  // Summary Stats
  summaryStats?: SummaryStat[];

  // Selection
  onRowClick?: (row: T) => void;

  // Customization
  emptyMessage?: string;
  tableClassName?: string;

  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onPageChange: (page: number) => void;
  };

  // Clear Filters
  showClearFilters?: boolean;
  onClearFilters?: () => void;

  // Loading Skeletons
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
    if (column.cell) {
      return column.cell(row);
    }

    const value = row[column.accessorKey as keyof T];
    return value as ReactNode;
  };

  // Calculate if any rows have actions (to show/hide actions column)
  const hasAnyActions = actions.length > 0 || getRowActions !== undefined;

  // Generate skeleton rows
  const skeletonRows = Array.from({ length: skeletonCount }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      {columns.map((column) => (
        <TableCell key={`skeleton-${String(column.accessorKey)}-${index}`}>
          <div className="h-6 animate-pulse rounded bg-gray-200"></div>
        </TableCell>
      ))}
      {hasAnyActions && (
        <TableCell>
          <div className="flex justify-end">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </TableCell>
      )}
    </TableRow>
  ));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summaryStats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-4 shadow-sm"
              title={stat.tooltip}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.icon && <div className="text-gray-400">{stat.icon}</div>}
              </div>
              <p
                className={`text-2xl font-bold ${stat.color || "text-gray-900"}`}
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
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.label}
                  value={filter.value}
                  onValueChange={filter.onValueChange}
                >
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                      {filter.icon}
                      <span>{filter.label}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {/* Clear Filters Button */}
              {showClearFilters && onClearFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-10 gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Add Button */}
        {onAdd && (
          <Button className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={column.className}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasAnyActions && (
                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                  className="py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-gray-100 p-3">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                // Get actions for this specific row
                const rowActions = getRowActions ? getRowActions(row) : actions;

                const hasRowActions = rowActions.length > 0;

                return (
                  <TableRow
                    key={index}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                    }
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.accessorKey)}
                        className={column.className}
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
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                                      ? "text-red-600 focus:text-red-600"
                                      : ""
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
                          // Empty cell to maintain table layout
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
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="text-sm text-gray-600">
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
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Simple page indicator */}
                <PaginationItem>
                  <span className="px-4 text-sm">
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
                        : "cursor-pointer"
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
