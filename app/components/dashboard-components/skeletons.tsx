import { Skeleton } from "@/app/components/ui/skeleton"

export function TableSkeleton() {
    return (
        <div className="w-full h-[400px] grid grid-rows-5 gap-2 p-5 pt-0">
            <div className="flex p-6 gap-4 bg-gray-900">
                <div className="w-1/4 h-auto">
                    <Skeleton className="w-full h-full" />
                </div>
                <div className="w-1/4 h-auto flex justify-center">
                    <Skeleton className="w-3/4 h-full" />
                </div>
                <div className="w-1/4 h-auto flex justify-center">
                    <Skeleton className="w-3/4 h-full" />
                </div>
                <div className="w-1/4 h-auto flex justify-center">
                    <Skeleton className="w-1/4 h-full" />
                </div>
            </div>
            <div className="flex p-6 gap-4">
                <div className="w-1/4">
                    <Skeleton className="w-full h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/3 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/3 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center gap-2">
                    <Skeleton className="w-1/4 bg-zinc-500" />
                    <Skeleton className="w-1/4 bg-zinc-500" />
                </div>
            </div>
            <div className="flex p-6 gap-4">
                <div className="w-1/4">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center gap-2">
                    <Skeleton className="w-1/4 bg-zinc-500" />
                    <Skeleton className="w-1/4 bg-zinc-500" />
                </div>
            </div>
            <div className="flex p-6 gap-4">
                <div className="w-1/4">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center gap-2">
                    <Skeleton className="w-1/4 bg-zinc-500" />
                    <Skeleton className="w-1/4 bg-zinc-500" />
                </div>
            </div>
            <div className="flex p-6 gap-4">
                <div className="w-1/4">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center">
                    <Skeleton className="w-2/4 h-full bg-zinc-500" />
                </div>
                <div className="w-1/4 flex justify-center gap-2">
                    <Skeleton className="w-1/4 bg-zinc-500" />
                    <Skeleton className="w-1/4 bg-zinc-500" />
                </div>
            </div>
        </div>
    )
}