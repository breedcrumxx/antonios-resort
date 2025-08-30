'use client';

import { defaultAgreement, defaultReservationConfig, PaymentsConfigType, PolicyType, ReservationConfigType } from '@/lib/configs/config-file';
import { CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { CreditCard, Vote } from "lucide-react";
import Link from 'next/link';
import React, { createContext, useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { usePackageData } from "../providers/package-data-provider";
import { coupons } from '@/lib/zod/z-schema';
import { z } from 'zod';

type Step = {
  title: string,
  status: "wait" | "process" | "finish" | "error",
  icon: React.JSX.Element
}[]

type CheckoutErrors = {
  date: boolean,
  nights: boolean,
  count: boolean,
}

type CheckoutDataContextType = {
  id: string,
  setId: React.Dispatch<React.SetStateAction<string>>,
  dateStart: Date | undefined
  setDateStart: React.Dispatch<React.SetStateAction<Date | undefined>>
  dateEnd: Date | undefined
  setDateEnd: React.Dispatch<React.SetStateAction<Date | undefined>>
  nights: number,
  setNights: React.Dispatch<React.SetStateAction<number>>
  tab: string,
  setTab: React.Dispatch<React.SetStateAction<string>>
  toggleErrors: CheckoutErrors,
  setToggleErrors: React.Dispatch<React.SetStateAction<CheckoutErrors>>,
  stepStatus: Step,
  setStepStatus: React.Dispatch<React.SetStateAction<Step>>,
  agreement: boolean,
  setAgreement: React.Dispatch<React.SetStateAction<boolean>>,
  paymentType: string,
  setPaymentType: React.Dispatch<React.SetStateAction<string>>,
  paymentOption: string,
  setPaymentOption: React.Dispatch<React.SetStateAction<string>>,
  calculation: CalculationType,
  setCalculation: React.Dispatch<React.SetStateAction<CalculationType>>
  bookingid: string,
  setBookingid: React.Dispatch<React.SetStateAction<string>>,
  transactionid: string,
  setTransactionid: React.Dispatch<React.SetStateAction<string>>,
  paymentsConfig: PaymentsConfigType,
  reservationConfig: ReservationConfigType,
  agreementContent: PolicyType,
  guestCount: GuestCount,
  setGuestCount: React.Dispatch<React.SetStateAction<GuestCount>>,
  slot: "day" | "night" | "regular",
  setSlot: React.Dispatch<React.SetStateAction<"day" | "night" | "regular">>,
  currentSlot: number,
  setCurrentSlot: React.Dispatch<React.SetStateAction<number>>,
  sets: number,
  setSets: React.Dispatch<React.SetStateAction<number>>,
  activeCoupons: z.infer<typeof coupons>[],
  setActiveCoupons: React.Dispatch<React.SetStateAction<z.infer<typeof coupons>[]>>,
}

export const CheckoutDataContext = createContext<CheckoutDataContextType>({
  id: "",
  setId: () => { },
  dateStart: undefined,
  setDateStart: () => { },
  dateEnd: undefined,
  setDateEnd: () => { },
  nights: 1,
  setNights: () => { },
  tab: "setup",
  setTab: () => { },
  toggleErrors: { date: false, nights: false, count: false },
  setToggleErrors: () => { },
  stepStatus: [],
  setStepStatus: () => { },
  agreement: false,
  setAgreement: () => { },
  paymentType: "",
  setPaymentType: () => { },
  paymentOption: "",
  setPaymentOption: () => { },
  calculation: {
    packageprice: 0,
    subtotal: 0,
    downpaymentpercentage: 0,
    discountpercentage: 0,
    discountamount: 0,
    total: 0,
    vat: 0,
  },
  setCalculation: () => { },
  bookingid: "",
  setBookingid: () => { },
  transactionid: "",
  setTransactionid: () => { },
  paymentsConfig: [],
  reservationConfig: defaultReservationConfig,
  agreementContent: defaultAgreement,
  guestCount: {
    adults: 0,
    seniorpwds: 0,
    teenkids: 0,
    celebrants: 0,
  },
  setGuestCount: () => { },
  slot: "day",
  setSlot: () => { },
  currentSlot: 0,
  setCurrentSlot: () => { },
  sets: 1,
  setSets: () => { },
  activeCoupons: [],
  setActiveCoupons: () => { }
})

interface GuestCount {
  adults: number,
  seniorpwds: number,
  teenkids: number,
  celebrants: number,
}

export default function CheckoutDataProvider({ children, reservationConfig, paymentsConfig, agreementContent }: { children: React.ReactNode, reservationConfig: ReservationConfigType, paymentsConfig: PaymentsConfigType, agreementContent: PolicyType }) {

  const { packagedata } = usePackageData()

  // states
  const [preventBooking, setPreventBooking] = useState<boolean>(false)
  const [toggleErrors, setToggleErrors] = useState<CheckoutErrors>({ date: false, nights: false, count: false })
  const [stepStatus, setStepStatus] = useState<Step>([
    {
      title: 'Setup',
      status: 'process',
      icon: <LoadingOutlined />,
    },
    {
      title: 'Payment',
      status: 'wait',
      icon: <CreditCard />,
    },
    {
      title: 'Summary',
      status: 'wait',
      icon: <Vote />,
    },
  ])
  const [agreement, setAgreement] = useState<boolean>(false)
  const [tab, setTab] = useState<string>("setup")

  // values
  const [dateStart, setDateStart] = useState<Date | undefined>()
  const [dateEnd, setDateEnd] = useState<Date | undefined>()
  const [nights, setNights] = useState<number>(1)
  const [sets, setSets] = useState<number>(1)
  const [slot, setSlot] = useState<"day" | "night" | "regular">("day")
  const [paymentType, setPaymentType] = useState<string>("Full payment");
  const [paymentOption, setPaymentOption] = useState<string>("GCash")
  const [bookingid, setBookingid] = useState<string>("")
  const [transactionid, setTransactionid] = useState<string>("")
  const [guestCount, setGuestCount] = useState<GuestCount>({
    adults: 1,
    seniorpwds: 0,
    teenkids: 0,
    celebrants: 0,
  })
  const [currentSlot, setCurrentSlot] = useState<number>(0)
  const [calculation, setCalculation] = useState<CalculationType>({
    packageprice: 0,
    subtotal: 0,
    downpaymentpercentage: 0,
    discountpercentage: 0,
    discountamount: 0,
    total: 0,
    vat: 0,
  })
  const [activeCoupons, setActiveCoupons] = useState<z.infer<typeof coupons>[]>([])
  const [id, setId] = useState<string>('')

  useEffect(() => {
    const updatedStepIndicator: Step = stepStatus.map((step, index) => {
      const currentStep = stepStatus.findIndex(item => item.title.toLowerCase() === tab)
      if (index < currentStep) {
        return { ...step, status: "finish", icon: <CheckCircleFilled /> };
      } else if (currentStep === 2) {
        return { ...step, status: 'finish', icon: <Vote className="text-blue-500" /> }
      } else if (index === currentStep) {
        return { ...step, status: "process", icon: <LoadingOutlined /> };
      } else {
        return step;
      }
    });
    setStepStatus(updatedStepIndicator);
  }, [tab])

  useEffect(() => {
    if (packagedata) {

      let price: number;

      if (packagedata.type == "cottage") {
        setSlot("regular")
        price = packagedata.regular_stay.price
      } else {
        price = slot == "day" ? packagedata.day_tour.price : packagedata.night_tour.price
      }

      // get the discounted price
      let discountpercentage = packagedata.discount
      let discountamount = 0

      if (activeCoupons.length > 0) {
        discountpercentage += activeCoupons
          .filter((item) => item.percent)
          .reduce((a, b) => a + b.amount, 0)

        discountamount = activeCoupons
          .filter((item) => !item.percent)
          .reduce((a, b) => a + b.amount, 0)
      }

      if ((guestCount.adults + guestCount.seniorpwds + guestCount.teenkids) >= 20 && packagedata.type != "cottage") { // if the combination of the adults and teens are less than max
        discountpercentage = discountpercentage + reservationConfig.discountoverpax
      }

      let downpaymentpercentage = 100 // default full payment

      if (paymentType == "Down payment") { // apply the downpayment percentage, and the balance to be paid on-site
        downpaymentpercentage = reservationConfig.downpayment
      }

      let subtotal = (price * nights) * sets
      let absolutereduced = subtotal - discountamount
      let percentagereduced = absolutereduced - (absolutereduced * (discountpercentage / 100))
      let totalamount = percentagereduced
      const vatable = totalamount * .12

      setCalculation({
        packageprice: price, // 1000
        subtotal: subtotal, // 1000 x 2
        downpaymentpercentage, // 30 %
        discountpercentage: discountpercentage, // 5 %
        discountamount: discountpercentage, // 5 %
        total: totalamount, // computed 
        vat: vatable,
      })
    }
  }, [packagedata, nights, guestCount, paymentType, sets, activeCoupons, slot])

  useEffect(() => { // check for payment configuration

    const payments = paymentsConfig.filter((item: PaymentQR) => item.gcashnumber.length > 0)

    if (payments.length == 0) {
      setPreventBooking(true)
      return
    }

  }, [paymentsConfig])

  return (
    <CheckoutDataContext.Provider value={{
      id,
      setId,
      dateStart,
      setDateStart,
      dateEnd,
      setDateEnd,
      nights,
      setNights,
      tab,
      setTab,
      toggleErrors,
      setToggleErrors,
      stepStatus,
      setStepStatus,
      agreement,
      setAgreement,
      paymentType,
      setPaymentType,
      paymentOption,
      setPaymentOption,
      calculation,
      setCalculation,
      bookingid,
      setBookingid,
      transactionid,
      setTransactionid,
      paymentsConfig,
      reservationConfig,
      agreementContent,
      guestCount,
      setGuestCount,
      slot,
      setSlot,
      currentSlot,
      setCurrentSlot,
      sets,
      setSets,
      activeCoupons,
      setActiveCoupons,
    }}>
      {children}
      <Dialog open={preventBooking}>
        <DialogContent onKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => { }} disableclose>
          <DialogHeader>
            <DialogTitle>No Payment Method Available</DialogTitle>
            <DialogDescription>
              It appears that no payment methods are currently available. This could be due to a technical issue or an oversight. Please try the following steps:
            </DialogDescription>
            <ol className="list-decimal list-inside mt-2">
              <li>Check your internet connection and try again.</li>
              <li>Contact our support team for further assistance.</li>
            </ol>
            <p className="text-sm text-gray-500">We apologize for the inconvenience and appreciate your patience.</p>
            <Link href="/" className="w-full flex justify-center py-2 text-white bg-prm">Return to home page</Link>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </CheckoutDataContext.Provider>
  )
}

export const useCheckout = () => {
  return useContext(CheckoutDataContext)
}