'use client'

import { TabsContent } from "@/app/components/ui/tabs"
import { useCheckout } from "../../provider"

export default function QRCodesGenerator() {

  const { paymentsConfig } = useCheckout()

  const placeholdersNeeded = 3 - paymentsConfig.length

  return (
    <>
      {
        paymentsConfig.map((item: PaymentQR, i: number) => (
          <TabsContent value={i.toString()} key={i}>
            <div className="w-[300px] h-[300px] bg-gray-500">
              <img src={item.image as string} className="aspect-square" alt="" />
            </div>
            <p className="text-lg text-center font-semibold">{item.gcashnumber}</p>
            <p className="text-lg text-center font-semibold">{item.accountname}</p>
          </TabsContent>
        ))
      }
      {
        Array.from({ length: placeholdersNeeded > 0 ? placeholdersNeeded : 0 }).map((_, i) => {
          console.log(i)
          return (
            <TabsContent value={(paymentsConfig.length + i).toString()} key={`placeholder-${i}`} >
              <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-300">
                <span>No image</span>
              </div>
            </TabsContent>
          )
        })
      }
    </>
  )
}