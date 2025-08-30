import { FaqConfigType } from "@/lib/configs/config-file"
import prisma from "@/lib/prisma"
import { systemLogger } from "@/lib/utils/api-debugger"
import { headers } from "next/headers"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion"

export default async function FAQSection() {

  try {

    const data = await prisma.system.findUnique({
      where: {
        name: "faqcontent"
      }
    })

    if (!data) throw new Error("Missing faq content.")

    const content: FaqConfigType = JSON.parse(data.config)

    return (
      <div className="w-full flex justify-center">
        <div className="w-full px-4 mb-10 sm:mb-0 sm:px-0 sm:w-[900px] sm:py-10 relative">
          <h1 className="text-4xl sm:text-6xl font-bold text-center elegant">Frequently asked questions</h1>
          <br />
          <p className="text-md sm:text-xl text-center">Quick answers to questions you may have.</p>
          <br />
          <Accordion type="single" collapsible className="w-full sm:px-32">
            {
              content.map((item, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger className="text-left elegant font-semibold text-xl">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            }
          </Accordion>
        </div>
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Displaying FAQ.", "GET", "Minor", "", "/faq-section")
    return <></>
  }
}