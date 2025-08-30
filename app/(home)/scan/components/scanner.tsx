'use client'

import { message } from 'antd';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Scanner() {

  const router = useRouter()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText, decodedResult) => {
        if (decodedText.includes("ACCESS")) {
          router.push(`/scan/access/${decodedText.slice(7)}`)
          return
        }
        if (decodedText.includes("CT-B")) {
          router.push(`/scan/${decodedText}`)
          return
        }
        if (decodedText.includes("CT-A")) {
          router.push(`/scan/services/${decodedText}`)
          return
        }

        message.error("Unknown QR code!")
      },
      (error) => {
      }
    );

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <>
      <div id="reader" className='w-full'></div>
    </>
  )
}