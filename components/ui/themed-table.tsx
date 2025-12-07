"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ThemedTableProps {
  children: React.ReactNode
  className?: string
}

export function ThemedTable({ children, className }: ThemedTableProps) {
  return (
    <div 
      className={cn("rounded-md border theme-border", className)}
      style={{
        backgroundColor: "var(--theme-background)",
        borderColor: "var(--theme-border)"
      }}
    >
      <Table className="theme-table">
        {children}
      </Table>
    </div>
  )
}

interface ThemedTableHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ThemedTableHeader({ children, className }: ThemedTableHeaderProps) {
  return (
    <TableHeader className={className}>
      <TableRow 
        style={{ 
          backgroundColor: "var(--theme-table-header)",
          borderBottom: "1px solid var(--theme-border)"
        }}
      >
        {children}
      </TableRow>
    </TableHeader>
  )
}

interface ThemedTableHeadProps {
  children: React.ReactNode
  className?: string
}

export function ThemedTableHead({ children, className }: ThemedTableHeadProps) {
  return (
    <TableHead 
      className={className}
      style={{ color: "var(--theme-text)" }}
    >
      {children}
    </TableHead>
  )
}

interface ThemedTableBodyProps {
  children: React.ReactNode
  className?: string
}

export function ThemedTableBody({ children, className }: ThemedTableBodyProps) {
  return (
    <TableBody className={className}>
      {children}
    </TableBody>
  )
}

interface ThemedTableRowProps {
  children: React.ReactNode
  className?: string
  selected?: boolean
  onClick?: () => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
}

export function ThemedTableRow({ 
  children, 
  className, 
  selected = false,
  onClick,
  onMouseEnter,
  onMouseLeave 
}: ThemedTableRowProps) {
  return (
    <TableRow
      className={cn("transition-colors cursor-pointer", className)}
      style={{
        backgroundColor: selected ? "var(--theme-table-row-selected)" : "var(--theme-table-row)",
        borderBottom: "1px solid var(--theme-border)"
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = selected 
          ? "var(--theme-table-row-selected)" 
          : "var(--theme-table-row-hover)"
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = selected 
          ? "var(--theme-table-row-selected)" 
          : "var(--theme-table-row)"
        onMouseLeave?.(e)
      }}
    >
      {children}
    </TableRow>
  )
}

interface ThemedTableCellProps {
  children: React.ReactNode
  className?: string
  colSpan?: number
}

export function ThemedTableCell({ children, className, colSpan }: ThemedTableCellProps) {
  return (
    <TableCell 
      className={className}
      colSpan={colSpan}
      style={{ color: "var(--theme-text)" }}
    >
      {children}
    </TableCell>
  )
}
