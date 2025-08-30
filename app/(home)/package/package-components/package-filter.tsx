'use client'

import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/app/components/ui/drawer";
import { Input } from '@/app/components/ui/input';
import { Label } from "@/app/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from '@/app/components/ui/separator';
import { Skeleton } from '@/app/components/ui/skeleton';
import { getSystemConfig } from '@/lib/actions/system-actions/system-config';
import { defaultReservationConfig } from '@/lib/configs/config-file';
import { cn } from '@/lib/utils/cn';
import { useAction } from '@/lib/utils/use-action';
import { add, format } from 'date-fns';
import { CalendarIcon, ListFilter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setPackageStore, usePackageStore } from '../stores/package-store';

export default function OnPackagePageFilter({
  user,
  findPackage,
  getSelected,
}: {
  user: UserSession | null,
  findPackage: () => void,
  getSelected: () => Date | {
    from: Date;
    to: Date;
  },
}) {

  const router = useRouter()
  const { headcount, type, days, date } = usePackageStore()

  // states
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)

  // values
  const { data, loading, error } = useAction(
    () => getSystemConfig('reservationconfig', defaultReservationConfig),
    (res, set, err) => {
      if (res.status == 500) {
        err(true)
        return
      }
      set(res.data)
      return true
    }
  )

  return (
    <>
      <div className="hidden sm:block lg:block xl:block h-full w-1/4 space-y-2 h-max p-4 border-[1px] bg-white rounded-lg">
        <h2 className="font-semibold text-sm text-center">Let me help you pick a package</h2>
        <Separator className="my-2" />
        <div>
          <Label htmlFor='adult'>Number of Guests?</Label>
          <Input
            id="adult"
            className="w-full"
            value={headcount}
            onChange={(e) => setPackageStore({ headcount: parseInt(e.target.value) })}
            type="number"
            placeholder="Head count..." />
        </div>
        <Separator className="my-2" />
        <div>
          <Label htmlFor='type'>Type</Label>
          <Select value={type} onValueChange={(e) => setPackageStore({ type: e as string })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="What's your plan?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Types</SelectLabel>
                <SelectItem value="cottage">Swimming</SelectItem>
                <SelectItem value="villa">Stay</SelectItem>
                <SelectItem value="event">Celebrate</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='days'>How many Days?</Label>
          <Input
            id="days"
            className="w-full"
            value={days}
            onChange={(e) => setPackageStore({ days: parseInt(e.target.value) })}
            min={1}
            type="number"
            placeholder="days.." />
        </div>
        <div>
          <Label>When do you plan to stay?</Label>
          {
            loading ? (
              <Skeleton className='w-full h-10' />
            ) : error ? (
              <div className="border border-red-500 h-10 flex items-center justify-center text-red-500 text-sm rounded-sm">An error occured!</div>
            ) : data && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMMM do yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="overflow-hidden p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date: Date | undefined) => setPackageStore({ date: date })}
                      modifiers={{
                        selected: getSelected()
                      }}

                      //check if the client package will fit in this date
                      disabled={(date) => {

                        // disable all past date
                        if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
                          return true
                        }

                        // disable the today's date plus 3 days ahead
                        if (new Date(date) <= add(new Date(), { days: data.leadtime })) {
                          return true
                        }

                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )
          }
        </div>

        <br />
        <Button
          onClick={() => findPackage()}
          disabled={error}
          className="w-full bg-prm">Find package</Button>
        {
          user && user.role.websitecontrol && (
            <Button
              className="w-full mt-2"
              onClick={() => router.push("/custom")}
              variant={"outline"}
            >Create new Package</Button>
          )
        }
      </div>

      <div className="flex sm:hidden fixed bottom-5 left-1/2 -translate-x-2/4 py-2 px-4 items-center rounded-full bg-white border z-[40]" onClick={() => setOpenDrawer(true)}>
        <ListFilter className="h-4 w-4 mr-2" />  Filter
      </div>

      <Drawer open={openDrawer} onOpenChange={(e) => setOpenDrawer(e)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Let me help you choose a package</DrawerTitle>
              <DrawerDescription>Find package base on your plan</DrawerDescription>
            </DrawerHeader>
            <div className="h-full w-full space-y-2">
              <div className="h-max p-4 bg-white rounded-lg">
                <div>
                  <Label htmlFor='adult'>Number of Guests?</Label>
                  <Input
                    id="adult"
                    className="my-2 w-full"
                    value={headcount}
                    onChange={(e) => setPackageStore({ headcount: parseInt(e.target.value) })}
                    type="number"
                    placeholder="Head count" />
                </div>
                <Separator className="my-2" />
                <div>
                  <Label htmlFor='type'>Type</Label>
                  <Select value={type} onValueChange={(e) => setPackageStore({ type: e as string })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="What you want to do?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Types</SelectLabel>
                        <SelectItem value="cottage">Swimming</SelectItem>
                        <SelectItem value="villa">Stay</SelectItem>
                        <SelectItem value="event">Celebrate</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='days'>Day/s</Label>
                  <Input
                    id="days"
                    className="my-2 w-full"
                    value={days}
                    onChange={(e) => setPackageStore({ days: parseInt(e.target.value) })}
                    min={1}
                    type="number"
                    placeholder="days.." />
                </div>
                <div>
                  <Label>When do you plan to stay?</Label>
                  {
                    loading ? (
                      <Skeleton className='w-full h-10' />
                    ) : error ? (
                      <div className="border border-red-500 h-10 flex items-center justify-center text-red-500 text-sm rounded-sm">An error occured!</div>
                    ) : data && (
                      <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "MMMM do yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="overflow-hidden p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(date: Date | undefined) => setPackageStore({ date: date })}
                              modifiers={{
                                selected: getSelected()
                              }}

                              //check if the client package will fit in this date
                              disabled={(date) => {

                                // disable all past date
                                if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
                                  return true
                                }

                                // disable the today's date plus 3 days ahead
                                if (new Date(date) <= add(new Date(), { days: data.leadtime })) {
                                  return true
                                }

                                return false
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )
                  }
                </div>

                <br />
                <Button
                  onClick={() => {
                    setOpenDrawer(false)
                    findPackage()
                  }}
                  className="w-full bg-prm">Find package</Button>
                {
                  user && user.role.websitecontrol && (
                    <Button
                      className="w-full mt-2 hidden sm:block"
                      onClick={() => router.push("/custom")}
                      variant={"outline"}
                    >Create new Package</Button>
                  )
                }
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}