'use client'

import { Button } from "@/app/components/ui/button";
import { legals } from "@/lib/zod/z-schema";
import { Spinner } from "@nextui-org/spinner";
import { message, Result } from "antd";
import axios from "axios";
import * as docx from 'docx-preview';
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
// @ts-ignore
import html2pdf from 'html2pdf.js';

const resolveSignature = async (url: string) => {
  try {
    const response = await axios.get(url, { responseType: 'blob' });
    return URL.createObjectURL(response.data);

  } catch (error) {
    message.error("Cannot get the signature!")
    return ""
  }
}

export default function LegalDocuments({ id, legal }: { id: string, legal: z.infer<typeof legals> | null }) {

  const ref = useRef<HTMLDivElement | null>(null)

  // states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/bookings/legals/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error()
        const arrayBuffer = await response.arrayBuffer();

        docx.renderAsync(arrayBuffer, ref.current as HTMLDivElement, ref.current as HTMLDivElement, {
          breakPages: true, //enables page breaking on page breaks
          ignoreLastRenderedPageBreak: true, //disables page breaking on lastRenderedPageBreak elements
          experimental: true, //enables experimental features (tab stops calculation)
          trimXmlDeclaration: true, //if true, xml declaration will be removed from xml documents before parsing
          renderHeaders: true, //enables headers rendering
          renderFooters: true, //enables footers rendering
          renderFootnotes: true, //enables footnotes rendering
          renderEndnotes: true, //enables endnotes rendering
        })
          .then(async () => {
            const paragraphs = (ref.current as HTMLDivElement).getElementsByTagName("p");
            const paragraphsArray = Array.from(paragraphs);
            if (legal) {
              for (let p of paragraphsArray) {
                if (p.innerText.startsWith("_")) {
                  // Create a new image element
                  const img = document.createElement("img");
                  img.src = await resolveSignature(legal.signature) // Add the correct image URL
                  img.alt = "Signature";
                  img.height = 150
                  img.width = 150
                  img.style.position = "absolute"
                  img.style.top = "50%"
                  img.style.transform = "translateY(-50%)"

                  p.prepend(img);
                  p.style.position = "relative"
                }
              }
            }

            setLoading(false)
          })

      } catch (error) {

        setLoading(false)
        setError(true)
      }
    }

    fetchData()
  }, [])

  const downloadToPDf = () => {
    const root = document.getElementById('waiver');
    const target = root?.getElementsByClassName('docx')
    if (target) {
      var opt = {
        filename: 'waiver.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, copyStyles: true, inlineImages: true },
        jsPDF: { unit: 'in', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(target[0]).save();
    }
  }

  return (
    <>
      {
        loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner label="Loading document, please wait..." />
          </div>
        ) : error && (
          <div className="w-full h-full flex justify-center items-center">
            <Result
              status="error"
              title="Unknown error occured!"
              subTitle="We cannot preview your document right now, please try again later!"
            />
          </div>
        )
      }
      {
        !(loading || error) && (
          <Button onClick={() => downloadToPDf()}>Download</Button>
        )
      }
      <div id="waiver" ref={ref}>
      </div>
    </>
  )
}