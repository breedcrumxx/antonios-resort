import ReloadProvider from "@/app/providers/reloader";
import TableTop from "./component/schedule-table";

export default function Schedules() {

  return (
    <div className="h-max px-4 overflow-y-scroll scroll">
      <ReloadProvider>
        <TableTop />
      </ReloadProvider>
    </div>
  )
}