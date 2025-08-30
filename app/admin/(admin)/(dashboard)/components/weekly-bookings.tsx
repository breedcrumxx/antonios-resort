import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/components/ui/table";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { getWeekRange } from "@/lib/utils/day-identifier";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { format } from "date-fns";
import { headers } from "next/headers";

export default async function WeeklyBookings() {

  const { monday, sunday } = getWeekRange(new Date())

  try {
    const data = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        checkin: 'desc'
      },
      where: {
        checkin: {
          gte: monday,
          lte: sunday,
        },
        status: {
          in: ["Pending", "Approved", "Ongoing"]
        }
      },
      select: {
        total: true,
        bookingid: true,
        checkin: true,
        packagedata: true,
        client: {
          select: {
            firstname: true,
            lastname: true,
          }
        }
      },
    });

    return (
      <Table className="scroll">
        <TableCaption>A list of this week bookings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">From</TableHead>
            <TableHead>Reservation</TableHead>
            <TableHead>Package</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            data.map((record) => (
              <TableRow key={record.bookingid} className="text-sm whitespace-nowrap">
                <TableCell className="font-medium">{record.client.firstname + " " + record.client.lastname}</TableCell>
                <TableCell>{format(record.checkin, "PPP")}</TableCell>
                <TableCell>{JSON.parse(record.packagedata).packagename}</TableCell>
                <TableCell className="text-right">&#8369; {(record.total).toLocaleString()}</TableCell>
              </TableRow>
            ))
          }
          {
            data.length == 0 && (
              <TableRow className="text-sm whitespace-nowrap">
                <TableCell className="font-medium"></TableCell>
                <TableCell></TableCell>
                <TableCell>No Data</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    )
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting dashboard data.", "GET", "Minor", '', "/weekly-bookings")
    return (
      <div className="w-full h-full">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="CMP-ERR-0002"
          subtitle="Unable to get the weekly bookings, please try again later."
          admin
        />
      </div>
    )
  }
}
