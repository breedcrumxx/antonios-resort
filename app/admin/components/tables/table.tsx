"use client"

import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { useReload } from "@/app/providers/reloader"
import { cn } from "@/lib/utils/cn"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import {
  ChevronDown,
  Plus,
  RefreshCw
} from "lucide-react"
import * as React from "react"
import { useEffect } from "react"
import { PaginationControls } from "../pagination/pagination-controls"

interface FlexTableProps {
  data: any;
  columns: any;
  hiddenfields?: any;
  searchRef?: string;
  loading: boolean;
  error: boolean;
  maxRow?: number;
  className?: string;
  callToAdd?: () => void; // Optional prop
  addlabel?: string,
  disableAdd?: boolean; // Optional prop
  disableReload?: boolean; // Optional prop
  disableSearch?: boolean; // Optional prop
  disablefiltering?: boolean; // Optional prop
  filtercomponent?: JSX.Element;
  searchfiltercomponent?: JSX.Element;
  defaultpagination?: boolean;
  getTableInstance?: (table: any) => void;
}

export function FlexTable(props: FlexTableProps) {

  const { setReload } = useReload()

  const {
    data,
    columns,
    hiddenfields,
    searchRef = "id",
    loading,
    error,
    maxRow = 10,
    className = "",
    callToAdd,
    addlabel,
    disableAdd = false,
    disableReload = false,
    disableSearch = false,
    disablefiltering = false,
    defaultpagination = true,
    filtercomponent = <></>,
    searchfiltercomponent = <></>,
    getTableInstance,
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>((hiddenfields && hiddenfields))
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: maxRow,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    // pageCount: 2,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  useEffect(() => {
    if (getTableInstance) {
      getTableInstance(table)
    }
  }, [getTableInstance])

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        {
          !disableSearch && (
            <Input
              placeholder="Search..."
              value={(table.getColumn(searchRef)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchRef)?.setFilterValue(event.target.value)
              }
              className="max-w-[300px]"
            />
          )
        }
        {
          searchfiltercomponent && (
            <>
              {searchfiltercomponent}
            </>
          )
        }
        {
          !disableReload && (
            <RefreshCw className="min-w-4 max-w-4 min-h-4 max-w-4 cursor-pointer" onClick={() => setReload(true)} />
          )
        }
        <div className="flex-grow"></div>
        {
          !disablefiltering && (
            <>
              {filtercomponent}
            </>
          )
        }
        {
          table
            .getAllColumns()
            .filter((column) => column.getCanHide()).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {((column.columnDef as ExtendClasses).alias ? (column.columnDef as ExtendClasses).alias : column.id)}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
        {
          !disableAdd && (
            <Button onClick={() => callToAdd?.()}>
              <Plus className="mr-2 w-4 h-4" />
              {addlabel ? addlabel : "Add"}
            </Button>
          )
        }
      </div>
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className={cn("py-2", (header.column.columnDef as ColumnDef<unknown, unknown> & ExtendClasses).headstyle)}
                      key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {
              error == true ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    There&apos;s a problem with the server...
                  </TableCell>
                </TableRow>
              ) : loading == true ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="py-2" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    key={`no-res`}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </div>
      {
        defaultpagination ? (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <>
            <PaginationControls />
          </>
        )
      }
    </div>
  )
}
