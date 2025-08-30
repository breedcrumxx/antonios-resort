'use server'

import { defaultReservationConfig, terms, waiver } from "@/lib/configs/config-file"
import { verifyConfig } from "@/lib/configs/verify-config"
import { mailOption, transporter } from "@/lib/nodemailer"
import { systemLogger } from "@/lib/utils/api-debugger"
import { getBaseUrl } from "@/lib/utils/get-baseurl"
import { render } from "@react-email/render"
import axios from "axios"
import { format } from "date-fns"
import Docxtemplater from "docxtemplater"
import { headers } from "next/headers"
import PizZip from "pizzip"
import ApprovedBookingEmail from "../../email-templates/approved-booking-email"
import prisma from "../../prisma"
import { createUserLog } from "../account-actions/create-user-log"

export const approveBooking = async (bookingid: string) => {

  try {

    const baseurl = getBaseUrl()

    const attachments = []

    const termresponse = await axios.get(terms, {
      responseType: "arraybuffer",
    });

    // Convert the arraybuffer response to binary string
    const termscontent = Buffer.from(termresponse.data, "binary").toString("binary");

    // Load the content into PizZip
    const termszip = new PizZip(termscontent);

    const termsdoc = new Docxtemplater(termszip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // update the status of the booking to approved
    const data = await prisma.booking.update({
      where: {
        id: bookingid
      },
      data: {
        status: "Approved"
      },
      select: {
        bookingid: true,
        packagedata: true,
        client: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    })

    // if the package is not a public swimming package
    if (JSON.parse(data.packagedata).type != "cottage") { // only do the process when needed
      const dataReservation = await prisma.system.findUnique({
        where: {
          name: "reservationconfig"
        }
      })

      const reservationConf = await verifyConfig(dataReservation, "reservationconfig", defaultReservationConfig)

      const waiverresponse = await axios.get(waiver, {
        responseType: "arraybuffer",
      });

      // Convert the arraybuffer response to binary string
      const waivercontent = Buffer.from(waiverresponse.data, "binary").toString("binary");

      const waiverzip = new PizZip(waivercontent);

      const waiverdoc = new Docxtemplater(waiverzip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      waiverdoc.render({
        client: data.client.firstname + " " + data.client.lastname,
        package: JSON.parse(data.packagedata).packagename,
        date: format(new Date(), "EEEE MMMM dd, yyyy 'at' h:mm a"),
        amount: reservationConf.securitydeposit,
        paidon: "",
        refundedon: "",
        partialrefundon: "",
        signedon: "",
        manager: reservationConf.manager,
        assistantmanager: reservationConf.assistant,
        image: "No image",
        refundamount: "",
      })

      const waiverbuff = waiverdoc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      attachments.push({
        filename: "waiver.docx",
        content: waiverbuff
      })
    } // on of the waiver process

    const termsbuff = termsdoc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const emailData = {
      name: data.client.firstname,
      bookingid: data.bookingid
    }

    // send an email to the user
    const emailHTML = render(<ApprovedBookingEmail baseUrl={baseurl} {...emailData} />)

    await transporter.sendMail({
      ...mailOption,
      to: data.client.email,
      subject: "Booking has been approved!",
      html: emailHTML,
      attachments: [...attachments, {
        filename: "terms-and-condition.docx",
        content: termsbuff
      }]
    })

    createUserLog("Approved a booking.")

    return { status: 200 }
  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Approving a booking.", "POST", "Fatal", JSON.stringify({ bookingid }), "/approve-booking")
    return { status: 500 }
  }

}