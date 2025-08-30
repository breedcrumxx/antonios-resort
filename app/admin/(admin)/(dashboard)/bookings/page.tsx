

import TableTop from "./booking-components/table-booking";
import ZoomerContextProvider from "./booking-components/zoomer-provider";

export default function BookingsPanel() {
  return (
    <div className="h-max px-4 overflow-y-scroll scroll">
      <ZoomerContextProvider>
        <TableTop />
      </ZoomerContextProvider>
    </div>
  )
}