import ErrorsTile from "../components/error-tile"
import DatabaseTile from "../components/system-db"
import SystemTile from "../components/system-tile"
import UserTile from "../components/user-tile"
import TableTop from "./components/maintenance-table"

export default function PerformanceAndMaintenancePage() {

  return (
    <div className="h-max p-4 space-y-4 overflow-y-scroll scroll">
      <section>
        <h2 className="font-semibold text-lg">Performance</h2>
        <div className="w-full grid grid-cols-4 gap-4">
          <DatabaseTile />
          <SystemTile />
          <UserTile />
          <ErrorsTile />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Maintenances</h2>
        <TableTop />
      </section>
    </div>

  )
}