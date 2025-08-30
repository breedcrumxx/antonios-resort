import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import { refunds } from "@/lib/zod/z-schema"
import { format } from "date-fns"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx'
import { z } from "zod"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const completedbookings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        checkout: {
          gte: body.get.start,
          lte: body.get.end,
        }
      },
      include: {
        transaction: true,
        refund: true,
        client: true,
        balance: {
          where: {
            type: {
              not: "Payment balance"
            }
          }
        }
      }
    })

    const redbookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: ["Completed", "Ongoing", "Pending", "Approved"],
        },
        checkout: {
          gte: body.get.start,
          lte: body.get.end,
        },
      },
      include: {
        transaction: true,
        refund: true,
        client: true,
        balance: {
          where: {
            type: {
              not: "Payment balance"
            }
          }
        }
      }
    })

    const completedrecords = completedbookings.map((item) => {
      return [
        item.bookingid,
        item.client.firstname + " " + item.client.lastname,
        item.client.email,
        JSON.parse(item.packagedata).packagename,
        format(item.book_at, "MM/dd/yyyy"),
        format(item.checkin, "MM/dd/yyyy"),
        format(item.checkout, "MM/dd/yyyy"),
        item.quantity.toString(),
        format(item.transaction?.date || new Date(), "MM/dd/yyyy"),
        item.transaction?.transactionid,
        item.transaction?.reference,
        item.refund?.refundables.toLocaleString(),
        item.refund?.refunded ? "Yes" : "No",
        item.total.toLocaleString(), // recompute
        item.balance
          .filter((x) => x.total > 0)
          .reduce((a, b) => a + b.total, 0).toLocaleString(),
      ]
    });

    const redrecords = redbookings.map((item) => {
      return [
        item.bookingid,
        item.client.firstname + " " + item.client.lastname,
        item.client.email,
        JSON.parse(item.packagedata).packagename,
        format(item.book_at, "MM/dd/yyyy"),
        format(item.transaction?.date || new Date(), "MM/dd/yyyy"),
        item.transaction?.transactionid,
        item.transaction?.reference,
        item.refund?.refundables,
        item.refund?.refunded ? "Yes" : "No",
        item.total,
        item.balance
          .filter((x) => x.total > 0)
          .reduce((a, b) => a + b.total, 0),
      ]
    });

    const completedrechedules = completedbookings.map((item) => {
      return item.balance
        .filter((x) => x.type == "Reschedule" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedpenalties = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Penalty" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedentrancefees = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Entrance" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const completedbreakage = completedbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Breakage" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)

    const redrechedules = redbookings.map((item) => {
      return item.balance
        .filter((x) => x.type == "Reschedule" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const redpenalties = redbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Penalty" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)
    const redentrancefees = redbookings.map((item) => {
      return item.balance
        .filter((item) => item.type == "Entrance" && item.total > 0)
        .reduce((a, b) => a + b.total, 0)
    }).reduce((a, b) => a + b, 0)

    const temparry = [...completedbookings, ...redbookings]

    // refundables
    const totalofcancelled = temparry
      .filter((item) => item.status == "Cancelled")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)
    const totalofcompleted = temparry
      .filter((item) => item.status == "Completed")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)
    const totalofrejected = temparry
      .filter((item) => item.status == "Rejected")
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const refunded = temparry
      .filter((item) => (item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const unclaimed = temparry
      .filter((item) => (item.refund as z.infer<typeof refunds>).isvalid && new Date((item.refund as z.infer<typeof refunds>).refundableuntil).getTime() >= new Date().getTime() && !(item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const invalid = temparry
      .filter((item) => !(item.refund as z.infer<typeof refunds>).isvalid)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const expired = temparry
      .filter((item) => (item.refund as z.infer<typeof refunds>).isvalid && new Date().getTime() > new Date((item.refund as z.infer<typeof refunds>).refundableuntil).getTime() && !(item.refund as z.infer<typeof refunds>).refunded)
      .reduce((a, b) => a + (b.refund as z.infer<typeof refunds>).refundables, 0)

    const ws = [
      ["COMPLETED BOOKINGS"],
      ["BOOKING ID", "CLIENT", "EMAIL", "PACKAGE NAME", "BOOK AT", "CHECK-IN", "CHECK-OUT", "SETS", "PAID ON", "TRANSACTION ID", "REFERENCE NO", "REFUNDABLE AMOUNT", "REFUNDED", "BOOKING", "EXTRAS"],
      ...completedrecords,
      [],
      ['CANCELLED-REJECTED'],
      ["BOOKING ID", "CLIENT", "EMAIL", "PACKAGE NAME", "BOOK AT", "PAID ON", "TRANSACTION ID", "REFERENCE NO", "REFUNDABLE AMOUNT", "REFUNDED", "BOOKING", "EXTRAS"],
      ...redrecords,
      [],
      ["TOTAL REFUNDS", (totalofcancelled + totalofcompleted + totalofrejected),],
      ["REFUNDED", refunded,],
      ["UNCLAIMED", unclaimed,],
      ["EXPIRED REFUNDS", expired],
      ["INVALID REFUNDS", invalid,],
      [],
      ["COMPLETED BOOKINGS", completedbookings.reduce((a, b) => a + b.total, 0)],
      ["RESCHEDULES", (completedrechedules + redrechedules),],
      ["PENALTIES", (completedpenalties + redpenalties),],
      ["BREAKAGE", completedbreakage,],
      ["ENTRANCE FEES", (completedentrancefees + redentrancefees),],
    ]

    const worksheet1 = XLSX.utils.aoa_to_sheet(ws);
    // const worksheet2 = XLSX.utils.json_to_sheet(summary);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet1, "Completed");
    // XLSX.utils.book_append_sheet(wb, worksheet1, "Cancelled-Rejected");
    // XLSX.utils.book_append_sheet(wb, worksheet2, "Summary");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Bookings.xlsx"',
      },
    })
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Exporting sales data.", "GET", "Moderate", "", "/sales/export")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }


}