
import ErrorsTile from "./components/error-tile"
import UserStat from "./components/regular-stat"
import RoleDistribution from "./components/role-distribution"
import DatabaseTile from "./components/system-db"
import SystemErrorDistribution from "./components/system-error-distribution"
import SystemStat from "./components/system-stat"
import SystemTile from "./components/system-tile"
import UserTile from "./components/user-tile"

export default function OverviewSystemControl() {

  return (
    <div className="h-max p-4 space-y-4 overflow-y-scroll scroll">
      <div className="w-full grid grid-cols-5 gap-4">
        <UserStat />
        <SystemStat />
      </div>

      <div className="w-full grid grid-cols-4 gap-2">
        <DatabaseTile />
        <SystemTile />
        <UserTile />
        <ErrorsTile />
      </div>

      <div className="grid grid-cols-3 grid-flow-row auto-rows-[50px] gap-4">
        <SystemErrorDistribution />
        <RoleDistribution />
      </div>
    </div>
  )
}