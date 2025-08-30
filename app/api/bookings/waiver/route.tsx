import { format } from "date-fns";
import Docxtemplater from "docxtemplater";
import { readFileSync } from "fs";
import path from "path";
import PizZip from "pizzip";

export async function GET() {
  const templatePath = path.resolve("legals/waiver.docx");
  const content = readFileSync(templatePath, "binary");

  // Create a PizZip instance to hold the content
  const zip = new PizZip(content);

  // Create a Docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // doc.setData();
  doc.render({
    client: "Dan Rosete",
    date: format(new Date(), "EEEE MMMM dd, yyyy 'at' h:mm a"),
    amount: "1,000",
    paidon: "{paidon}",
    refundedon: "{refundedon}",
    partialrefundon: "{partialrefundon}",
    signedon: "{signedon}",
    manager: "Raven Sanao",
    assistantmanager: "Antonio's",
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    compression: "DEFLATE",
  });


  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="waiver.docx"'
    },
  })
}