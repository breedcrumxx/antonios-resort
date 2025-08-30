import { Separator } from "@/app/components/ui/separator";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function CustomPackageFallBack() {
  return (
    <>
      {
        Array.from(Array(5), (_, i) => (
          <div className="w-full h-auto sm:h-[250px] block sm:flex border rounded-md p-4" key={i}>
            <div className="w-full h-[250px] sm:h-full sm:min-w-[30%] sm:max-w-[30%] grid grid-cols-3 grid-rows-3 gap-1">
              <div className="flex items-center justify-center col-span-3 row-span-2 bg-gray-300 overflow-hidden relative">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="flex items-center justify-center col-span-1 row-span-1 bg-gray-300 overflow-hidden relative">
                <Skeleton className="w-full h-full" />
              </div>
            </div>

            <div className="flex-grow block space-y-2 sm:space-y-0 sm:flex">
              <div className="hidden sm:flex w-full sm:w-4/6 h-full flex flex-col p-2">
                <Skeleton className="w-32 h-4 bg-gray-400" />
                <Separator className="my-2" />
                <div className="space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>

              <div className="flex-grow flex flex-col space-y-2">
                <Skeleton className="w-full h-4" />
                <div className="flex-grow"></div>
                <Skeleton className="self-end w-12 h-4" />
                <Skeleton className="self-end w-16 h-4" />
                <Skeleton className="w-full h-8 bg-gray-400" />
              </div>
            </div>
            <Skeleton />
          </div>
        ))
      }
    </>
  )
}