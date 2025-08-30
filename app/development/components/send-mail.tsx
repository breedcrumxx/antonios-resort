'use server'

import { mailOption, transporter } from "@/lib/nodemailer";
import { format } from "date-fns";
import Docxtemplater from "docxtemplater";
import { readFileSync } from "fs";
import path from "path";
import PizZip from "pizzip";

export const sendMail = async () => {
  try {
    const templatePath = path.resolve("./waiver.docx");
    const content = readFileSync(templatePath, "binary");

    // Create a PizZip instance to hold the content
    const zip = new PizZip(content);

    // Create a Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      client: "Dan Rosete",
      date: format(new Date(), "EEEE MMMM dd, yyyy 'at' h:mm a"),
      amount: "1,000",
      paidon: "",
      refundedon: "",
      partialrefundon: "",
      signedon: "",
      manager: "Raven Sanao",
      assistantmanager: "Antonio's",
    });

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });


    await transporter.sendMail({
      ...mailOption, to: "dandan213123@gmail.com", subject: "test", text: "here is the attachement.",
      attachments: [{
        filename: "waiver.docx",
        content: buf
      }]
    })

  } catch (error) {
    console.log(error)
  }
}