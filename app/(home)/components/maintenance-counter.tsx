'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { getActiveMaintenance } from "@/lib/actions/system-actions/system-maintenance"
import { maintenanceschema } from "@/lib/zod/z-schema"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function MaintenanceCounter() {

  const pathname = usePathname()

  const [maintenance, setMaintenance] = useState<z.infer<typeof maintenanceschema>>()
  const [timeLeft, setTimeLeft] = useState<{ minutes: number, seconds: number }>({ minutes: 0, seconds: 0 })

  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchData = async () => {
      const response = await getActiveMaintenance()

      if (response.status !== 200 && response.status !== 201) return
      if (response.data && response.data.status == "Pending") { // only start the maintenance counter when status == pending

        setMaintenance(response.data)
        const updateTimeLeft = () => {
          const now = new Date().getTime();
          const startTime = new Date(response.data.start).getTime();
          const difference = startTime - now;

          if (difference > 0) {
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ minutes, seconds });
          } else {
            setTimeLeft({ minutes: 0, seconds: 0 }); // Maintenance has started
            window.location.reload()
          }
        };

        updateTimeLeft();
        interval = setInterval(updateTimeLeft, 1000);
      }

    }

    fetchData()

    return () => clearInterval(interval);
  }, [pathname])

  return (
    <>
      {
        maintenance && (timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="animate-warning-flash fixed z-500 bottom-5 left-1/2 -translate-x-2/4 flex border rounded-lg bg-white p-4 text-sm text-black">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-2" />
                  <span>Maintenance starts in {timeLeft.minutes} minutes and {timeLeft.seconds} seconds.</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-64 text-justify">
                Maintenance is starting soon. To avoid potential data loss, we strongly recommend completing and saving all tasks before the maintenance period begins. Thank you for your understanding.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    </>
  )
}
