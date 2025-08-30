import { defaultReservationConfig } from "@/lib/configs/config-file";
import { verifyConfig } from "@/lib/configs/verify-config";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { format } from "date-fns";
import Docxtemplater from "docxtemplater";
import { readFileSync } from "fs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import PizZip from "pizzip";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const templatePath = path.resolve("./legals/waiver.docx");
    const content = readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const dataReservation = await prisma.system.findUnique({
      where: { name: "reservationconfig" }
    });

    const reservationConf = await verifyConfig(dataReservation, "reservationconfig", defaultReservationConfig);

    const data = await prisma.booking.findUnique({
      where: { id: context.params.id },
      select: {
        legal: true,
        checkin: true,
        packagedata: true,
        client: {
          select: { firstname: true, lastname: true }
        }
      }
    });

    if (!data || !data.legal) {
      return NextResponse.json({ message: "Not found!" }, { status: 404 });
    }
    const currentpackage = JSON.parse(data.packagedata)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    // Render the document with the data and signature
    doc.render({
      client: data.client.firstname + " " + data.client.lastname,
      date: format(data.checkin, "EEEE MMMM dd, yyyy 'at' h:mm a"),
      package: currentpackage.packagename,
      amount: reservationConf.securitydeposit,
      paidon: format(data.legal.paid_on, "MM/dd/yyyy h:mm a"),
      refundedon: data.legal.refunded_on ? format(data.legal.refunded_on, "MM/dd/yyyy h:mm a") : "",
      refundamount: data.legal.refunded_amount ? "₱ " + data.legal.refunded_amount.toLocaleString() : "",
      signedon: format(data.legal.paid_on, "MM/dd/yyyy h:mm a"),
      manager: reservationConf.manager,
      assistantmanager: reservationConf.assistant,
    });

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="waiver.docx"'
      },
    });

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting documents.", "GET", "Moderate", "", "/legals");
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 });
  }
}