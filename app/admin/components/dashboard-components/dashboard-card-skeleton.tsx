import { Card, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { Skeleton } from "@/app/components/ui/skeleton"

export default function DashboardCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-4 w-[50px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </CardHeader>
    </Card>
  )
}