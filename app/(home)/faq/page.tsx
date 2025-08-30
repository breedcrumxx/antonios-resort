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
import ConcernForm from "./components/concern-form"


export default async function FAQPage() {

  try {

    const data = await prisma.system.findUnique({
      where: {
        name: "faqcontent"
      }
    })

    if (!data) throw new Error("Missing faq content.")

    const content: FaqConfigType = JSON.parse(data.config)

    return (
      <div className="min-w-screen min-h-screen">
        <div className="w-full flex justify-center">
          <div className="w-full px-4 sm:px-0 sm:w-[900px] py-10 relative">
            <h1 className="text-4xl sm:text-6xl font-bold sm:text-center elegant">Frequently asked questions</h1>
            <br />
            <p className="text-md sm:text-center">Quick answers to questions you may have. Can&apos;t find what you are looking for? <a href="#form" className="font-bold underline cursor-pointer">Reach out to us.</a></p>
            <br />
            <div className="px-32 hidden sm:block">
              <ul className="list-disc space-y-4">
                {
                  content.map((item, i) => (
                    <li key={i}>
                      <div className="space-y-2">
                        <h1 className="font-bold elegant text-lg underline">{item.question}</h1>
                        <p className="text-sm">{item.answer}</p>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </div>

            <Accordion type="single" collapsible className="w-full block sm:hidden">
              {
                content.map((item, i) => (
                  <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                    <AccordionContent>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
            </Accordion>

            <br />
            <br />
            <br />
            <ConcernForm />
          </div>
        </div>
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Displaying FAQ.", "GET", "Minor", "", "/faq-section")
    return <></>
  }
}