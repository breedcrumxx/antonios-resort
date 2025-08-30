'use client'

import html2canvas from "html2canvas-pro";
import { Download } from 'lucide-react';

export default function DownloadReceipt() {
  const downloadToPDf = () => {
    const root = document.getElementById('receipt');

    if (!root) return

    html2canvas(root, { scale: 2 }).then(canvas => {
      const imageURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "screenshot.png";

      link.click();
    })
  }

  return (
    <>
      <div
        data-html2canvas-ignore="true"
        className='text-prm flex justify-center mt-2'
        onClick={() => downloadToPDf()}>
        <div className="flex items-center cursor-pointer hover:underline"><Download className="mr-4 w-4 h-4" /> Download </div>
      </div>
    </>
  )
}