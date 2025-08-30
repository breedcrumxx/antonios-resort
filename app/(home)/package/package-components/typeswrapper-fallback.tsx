import { Skeleton } from "@/app/components/ui/skeleton";

export default function TypesWrapperFallback() {
  return (
    <>
      <Skeleton className="h-4 w-full my-1" />
      <Skeleton className="h-4 w-full my-1" />
      <Skeleton className="h-4 w-full my-1" />
    </>
  )
}