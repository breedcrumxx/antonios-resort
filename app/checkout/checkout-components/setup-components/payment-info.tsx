'use client'

import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useCheckout } from "../../provider"
import { usePackageData } from "@/app/providers/package-data-provider"

export default function PaymentInformation() {

  const paymentOptions = [
    { name: 'GCash', status: true },
    { name: 'Paymaya', status: false },
    { name: 'Paypal', status: false },
  ]

  const { packagedata } = usePackageData()
  const { paymentType, setPaymentType, paymentOption, setPaymentOption, reservationConfig } = useCheckout()

  return (
    <div className="space-y-2 py-2">
      <div className="w-full sm:w-1/2">
        <Label>Payment option</Label>
        <Select onValueChange={(e) => setPaymentOption(e)} defaultValue={paymentOption}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              {
                paymentOptions.map((item, i) => (
                  <SelectItem value={item.name} disabled={!item.status} key={i}>{item.name}</SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <br />
      <div className="w-full sm:w-1/2">
        <Label>Payment type</Label>
        <Select onValueChange={(e) => setPaymentType(e)} defaultValue={paymentType} disabled={reservationConfig.allowonlyfullpayment && (packagedata?.type == "cottage")}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="Down payment">Down payment ({reservationConfig.downpayment}%) </SelectItem>
              <SelectItem value="Full payment">Full payment</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {
          reservationConfig.allowonlyfullpayment && (
            <p className="text-sm text-blue-500">We only allow full payment for public swimming and cottages.</p>
          )
        }
      </div>
      <p className="text-sm">Before proceeding to payment, please be sure to read the <span className="text-blue-500">cancellation and refund policy</span>, as well as the important notes.</p>
    </div>
  )
}