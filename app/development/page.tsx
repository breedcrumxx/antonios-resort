'use client'

import { EdgeStoreProvider } from "@/lib/edgestore"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
import { Switch } from "../components/ui/switch"
import { batchInsert, generateRandomVisits, generateUsers, genYearlyBooking, insertUsers, insertWebsiteVisits, wipeBookings, wipeUsers } from "./components/parser"
import { InsertDocuments } from "./insert-documents"
import { InsertPageImages } from "./insert-page-images"

export default function Development() {

  // states
  const [temporary, setTemporary] = useState<boolean>(false)

  // const handleTest = async () => {
  //   const response = await authenticateUser("breedcrumxx@gmail.com", "dandan21313")
  //   console.log(response)
  // }

  // const handleTestRebooking = async () => {
  //   const response = await requestRebook("3b24b6ee-d3f1-4e86-8287-c9d9878e58ea", "1")

  //   console.log(response)
  // }
  // const data = {
  //   name: "Dan Rosete",
  //   packagename: "STD-DAYTOUR",
  //   bookDate: "04-16-2024",
  //   startDate: "04-21-2024",
  //   endDate: "04-25-2024",
  //   paymentOption: "GCash",
  //   paymenttype: "Full payment",
  //   calculation: {
  //     packageprice: 1600,
  //     servicesprice: 600,
  //     setprice: 2200,
  //     discountedamount: 110,
  //     vat: 250.8,
  //   },
  //   units: 2,
  //   bookingid: "5749-39579-4896",
  //   transactionid: "7594-69676-4840",
  //   packagediscount: 5,
  //   amountpaid: 800,
  // }

  const getDocs = async () => {
    try {
      const response = await fetch(`/api/bookings/waiver`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waiver.docx'; // The filename for the download
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error)
    }
  }

  // bookings
  const [yearBooking, setYearBooking] = useState<string>("")
  const [monthBooking, setMonthBooking] = useState<string>("")

  // user
  const [yearUser, setYearUser] = useState<string>("")
  // const [monthUser, setMonthUser] = useState<string>("")

  return (
    <div className="min-h-screen min-w-screen py-10 px-32">
      <h1 className="text-6xl font-bold">Developers Dummy Data</h1>
      <p>If you are not a developer or don&apos;t know what are these about, please don&apos;t touch anything.</p>

      <br />
      <h1 className="text-xl font-semibold">Booking Data Generator</h1>
      <p className="text-md">Generate booking dummy data for specific date range at ease.</p>

      <div className="space-y-2 my-2 max-w-[50vw]">
        <Select onValueChange={(e) => setYearBooking(e)} >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choose year..." />
          </SelectTrigger>
          <SelectContent>
            {
              Array.from({ length: 5 }, (_, n) => new Date().getFullYear() - n).map((item, i) => (
                <SelectItem value={`${item}`} key={i}>{item}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        {/* <Select onValueChange={(e) => setMonthBooking(e)} >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choose month..." />
          </SelectTrigger>
          <SelectContent>
            {
              months.map((item, i) => (
                <SelectItem value={item} key={i}>{item}</SelectItem>
              ))
            }
          </SelectContent>
        </Select> */}
        <Separator className="my-2" />
        <div className="space-y-2">
          <Button className="w-[250px]" onClick={async () => genYearlyBooking(yearBooking)}>Generate batch bookings</Button>
          <p className="text-sm">Generate yearly booking dummy data.</p>
        </div>
        <div className="space-y-2">
          <Button className="w-[250px]" onClick={async () => batchInsert(yearBooking)}>Batch insert bookings</Button>
          <p className="text-sm">Insert yearly booking dummy data.</p>
        </div>
        <div className="space-y-2">
          <Button className="w-[250px]" variant={"destructive"} onClick={async () => await wipeBookings()}>Wipe bookings</Button>
          <p className="text-sm">Clear the bookings and all the data related to bookings.</p>
        </div>
      </div>

      <br />
      <br />
      <h1 className="text-xl font-semibold">Users Data Control</h1>
      <p className="text-md">Generate user dummy data for specific date range at ease.</p>
      <div className="space-y-2 my-2 max-w-[50vw]">
        <Select onValueChange={(e) => setYearUser(e)} >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choose year..." />
          </SelectTrigger>
          <SelectContent>
            {
              Array.from({ length: 5 }, (_, n) => new Date().getFullYear() - n).map((item, i) => (
                <SelectItem value={`${item}`} key={i}>{item}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <Separator className="my-2" />
        <div className="space-y-2">
          <div className="space-y-2">
            <Button className="w-[250px]" onClick={() => insertUsers(yearUser)}>Insert users</Button>
            <p className="text-sm">Insert user dummy data base on the year generated files.</p>
          </div>
          <div className="space-y-2">
            <Button className="w-[250px]" onClick={() => generateUsers(yearUser)}>Generate users</Button>
            <p className="text-sm">Generate user accounts for specific year..</p>
          </div>
          <div className="space-y-2">
            <Button className="w-[250px]" onClick={() => insertWebsiteVisits(yearUser)}>Insert website visits</Button>
            <p className="text-sm">Insert website visit dummy data base on the year generated files.</p>
          </div>
          <div className="space-y-2">
            <Button className="w-[250px]" onClick={() => generateRandomVisits(yearUser)}>Generate website visits</Button>
            <p className="text-sm">Generate website visits for specific year.</p>
          </div>
          <div className="space-y-2">
            <Button className="w-[250px]" variant={"destructive"} onClick={() => wipeUsers()}>Wipe users</Button>
            <p className="text-sm">Clear the users and all the data related to users.</p>
          </div>
        </div>

        <br />
        <br />
        <h1 className="text-xl font-semibold">Reusable Dummy Image</h1>
        <p className="text-md">Upload a reusable dummy image.</p>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode"
            checked={temporary}
            onCheckedChange={setTemporary}
          />
          <Label htmlFor="airplane-mode">Temporary mode</Label>
        </div>
        <EdgeStoreProvider>
          <InsertPageImages temporary={temporary} />
          <InsertDocuments temporary={temporary} />
        </EdgeStoreProvider>
      </div>
    </div>
  )
}
