import ReloadProvider from "@/app/providers/reloader";
import TableTop from "./components/coupons-table";
import ZoomerContextProvider from "../bookings/booking-components/zoomer-provider";

export default function CouponsPage() {

  return (
    <ZoomerContextProvider>
      <ReloadProvider>
        <div className="h-max px-4 overflow-y-auto scroll">
          <TableTop />
        </div>
      </ReloadProvider>
    </ZoomerContextProvider>
  )
}