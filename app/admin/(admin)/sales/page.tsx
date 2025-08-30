
import { getBookingGrowth, getCompletedBookingsTotal, getPendingBookingsTotal, getRefundables, getTotalIncome } from "@/lib/actions/dashboard-calls/sales-overview/bookings-sales";
import DataStrip from "./components/overview-components/data-chip";
import FilterFloater from "./components/overview-components/filter-floater";
import OverviewDataCard from "./components/overview-components/ovr-data-card";
import RefundableExtraInfo from "./components/overview-components/refundable-extra-info";
import TableBookingSales from "./components/overview-components/table-booking-sales";
import TotalEarningExtraInfo from "./components/overview-components/total-earnings-extra-info";
import FilterProvider from "./components/provider";
import ZoomerContextProvider from "../(dashboard)/bookings/booking-components/zoomer-provider";

export default function SalesOverview() {
  return (
    <FilterProvider>
      <div className="h-full w-full flex flex-col gap-2 p-4 bg-gray-100 overflow-y-scroll scroll">
        <div className="w-full p-2 flex gap-4 justify-center border rounded-xl bg-white relative">
          <div className="flex justify-between items-center py-2 px-4 gap-5 border rounded-xl bg-gray-100">
            <DataStrip />
          </div>
          <FilterFloater />
        </div>
        <div className="stats shadow bg-white w-full min-h-[100px]">
          <OverviewDataCard
            header="Pending bookings"
            position="center"
            footer="This month"
            method={getPendingBookingsTotal}
            money
            scale
          />
          <OverviewDataCard
            header="Completed bookings"
            position="center"
            footer="This month"
            method={getCompletedBookingsTotal}
            money
            scale
          />
          <OverviewDataCard
            header="Refunds"
            position="center"
            footer="from completed bookings"
            method={getRefundables}
            extra={<RefundableExtraInfo />}
            money
            scale
          />
          <OverviewDataCard
            header="Total income"
            position="start"
            footer="This month"
            method={getTotalIncome}
            extra={<TotalEarningExtraInfo />}
            money
            scale
          />
          <OverviewDataCard
            header="Net growth"
            position="start"
            footer="From previous month"
            method={getBookingGrowth}
            percent
          />
        </div>
        <div className="w-full h-max p-4 border rounded-xl bg-white">
          <ZoomerContextProvider>
            <TableBookingSales />
          </ZoomerContextProvider>
        </div>
      </div>
    </FilterProvider>
  )
}