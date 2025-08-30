'use client'

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { SingleImageDropzone } from "@/app/components/upload-dropdown/image-dropzone";
import { defaultPaymentConfig, PaymentsConfigType } from "@/lib/configs/config-file";
import { loadConfig } from "@/lib/configs/load-config";
import { useEdgeStore } from "@/lib/edgestore";
import FullCoverLoading from "@/lib/utils/full-cover-loading";
import { message } from 'antd';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentsConfigForm({ payments }: { payments: PaymentsConfigType }) {

  const router = useRouter()

  // context
  const { edgestore } = useEdgeStore();

  // states
  const [loading, setLoading] = useState<string>("")

  // values
  const [paymentQrs, setPaymentsQRs] = useState<PaymentQR[]>(payments.length > 0 ? payments : defaultPaymentConfig)

  // form controls
  const handleImageChange = (id: number, image: File) => {
    setPaymentsQRs(prevState =>
      prevState.map(qr =>
        qr.id === id ? { ...qr, image } : qr
      )
    );
  };

  const handleGcashNumberChange = (id: number, gcashnumber: string) => {
    setPaymentsQRs(prevState =>
      prevState.map(qr =>
        qr.id === id ? { ...qr, gcashnumber } : qr
      )
    );
  };

  const handleGcashAccountNameChange = (id: number, accountname: string) => {
    setPaymentsQRs(prevState =>
      prevState.map(qr =>
        qr.id === id ? { ...qr, accountname } : qr
      )
    );
  };

  const validatePaymentsQRs = (paymentQrs: PaymentQR[]) => {
    let isValid = true;
    let hasAtLeastOneFilled = false;

    for (const qr of paymentQrs) {
      const isFilled = qr.image || qr.gcashnumber || qr.accountname;

      if (isFilled) {
        hasAtLeastOneFilled = true;
        if (!qr.image || !qr.gcashnumber || !qr.accountname) {
          isValid = false;
          break;
        }
      }
    }

    if (!hasAtLeastOneFilled) {
      isValid = false;
    }

    return isValid;
  };

  const validateGcashNumbers = (paymentQrs: PaymentQR[]) => {
    for (const item of paymentQrs) {
      if (item.gcashnumber.length !== 11 && item.gcashnumber.length > 0) {
        return false;
      }
    }
    return true;
  };


  const handleSubmit = async () => {
    if (validatePaymentsQRs(paymentQrs)) {
      // Proceed with form submission
      setLoading("Checking validity...")

      if (!validateGcashNumbers(paymentQrs)) {
        message.error("Invalid GCash number!");
        setLoading("")
        return;
      }

      setLoading("Saving configuration...")

      // upload the images first
      let updatedqrs: PaymentQR[] = []
      await Promise.all(
        paymentQrs.map(async (item) => {
          if (!item.image) {
            updatedqrs.push(item)
          } else if (item.image instanceof File) {
            try {
              const res = await edgestore.publicImages.upload({
                file: item.image,
              });
              updatedqrs.push({ ...item, image: res.url });
            } catch (err) {
              updatedqrs.push({ id: item.id, gcashnumber: "", image: "", accountname: "" })
              message.error(`Failed to upload QR ${item.id}`);
            }
          } else {
            // If the image is already a string, push it
            updatedqrs.push(item);
          }
        })
      );

      const response = await loadConfig("paymentsconfig", JSON.stringify(updatedqrs), true)
      setLoading("")

      if (response.status == 500) {
        message.error("Unable to update configuration!")
        return
      }

      message.success("Successfully updated payments configuration.")
      router.refresh()
    } else {
      // Show warning
      message.error("Please ensure at least one QR is completely filled or remove partially filled data.");
    }
  };

  return (
    <div className="w-full h-auto py-4 px-10">
      <div className="w-full flex justify-between items-center">
        <h1 className="font-semibold text-lg">Configure settings for payments</h1>
      </div>
      <br />
      <div className="w-full px-4">
        <h1 className="font-semibold">Payment options</h1>
        <br />
        <div className="w-full flex gap-4">
          {paymentQrs.map((qr) => (
            <div className="w-1/3 h-auto flex flex-col items-center p-2 space-y-2 overflow-hidden" key={qr.id}>
              <Label>QR {qr.id}</Label>
              <SingleImageDropzone
                width={200}
                height={200}
                className="w-full h-auto aspect-square"
                value={qr.image}
                onChange={(file) => handleImageChange(qr.id, file as File)}
              />
              <Input
                className="w-full"
                type="number"
                min={11}
                max={11}
                placeholder="GCash number"
                value={qr.gcashnumber}
                onChange={(e) => handleGcashNumberChange(qr.id, e.target.value)}
              />
              <Input
                className="w-full"
                placeholder="GCash account name"
                value={qr.accountname}
                onChange={(e) => handleGcashAccountNameChange(qr.id, e.target.value)}
              />
            </div>
          ))}
        </div>
        <br />
        <br />
        <p className="my-2 text-sm text-gray-500">Please ensure all the details above is correct to avoid transactional issues.</p>
        <Button onClick={() => handleSubmit()}>Update settings</Button>
      </div>

      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </div>
  )
}