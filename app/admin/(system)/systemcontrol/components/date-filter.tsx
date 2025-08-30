'use client'

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Checkbox } from "@/app/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { CalendarSearch, Check, RotateCcw } from "lucide-react"
import { DateRange } from "react-day-picker"

export type CalendarFilterProps = {
  date: Date | DateRange | undefined,
  enableRange: boolean,
  startTime: string,
  endTime: string,
  setDateQuery: (value: DateRange | undefined) => void,
  setDate: (value: Date | DateRange | undefined) => void,
  setStartTime: (value: string) => void,
  setEndTime: (value: string) => void,
  setEnableRange: (value: boolean) => void,
  setDateFilter: () => void,
  title?: string,
}

export default function CalendarFilter(Props: CalendarFilterProps) {

  const singleDateProps = {
    mode: "single" as const,
    selected: Props.date as Date | undefined,
  };

  const rangeDateProps = {
    mode: "range" as const,
    selected: Props.date as DateRange | undefined,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <CalendarSearch className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {
          Props.title && (
            <>
              <DropdownMenuLabel>{Props.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )
        }
        <div className="flex gap-2 items-center py-2 px-4 hover:bg-accent hover:text-accent-foreground rounded-sm">
          <Checkbox id="date-range" checked={Props.enableRange} onCheckedChange={(e: boolean) => {
            Props.setDate(undefined) // reset the date
            Props.setStartTime("00:00") // reset the date
            Props.setEndTime("23:59") // reset the date
            Props.setEnableRange(e)
          }} />
          <Label htmlFor="date-range">Date range</Label>
        </div>
        <Calendar
          initialFocus
          {...(Props.enableRange ? rangeDateProps : singleDateProps)}
          onSelect={Props.setDate}
          numberOfMonths={Props.enableRange ? 2 : 1}
        />
        {
          !Props.enableRange && (
            <div className="flex gap-2">
              <Input type="time" value={Props.startTime} onChange={(e) => Props.setStartTime(e.target.value)} />
              <Input type="time" value={Props.endTime} onChange={(e) => Props.setEndTime(e.target.value)} />
            </div>
          )
        }
        <DropdownMenuItem onClick={() => Props.setDateFilter()} disabled={Props.date == undefined}>
          <Check className="mr-2 h-4 w-4" />
          <span>Set</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500" onClick={() => {
          Props.setDate(undefined) // reset the date
          Props.setDateQuery(undefined) // reset query date
          Props.setStartTime("00:00") // reset the date
          Props.setEndTime("23:59") // reset the date
        }}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>Reset</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}