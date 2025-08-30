import { Separator } from "@/app/components/ui/separator"
import {
  AreaChart,
  Banknote,
  BookCheck,
  Bug,
  Calendar,
  CircleUserRound,
  ClipboardList,
  Cog,
  Coins,
  FileSliders,
  FolderCog,
  Gauge,
  Grid2X2,
  Inbox,
  Package2,
  Settings2,
  ShieldAlert,
  TicketPercent,
  User,
  UserCog
} from "lucide-react"

export type SubRouteCollectionType = {
  route: string,
  routes: SubRoutesType[]
}

export type SubRoutesType = {
  name: string,
  title: string,
  link: string,
  icon: JSX.Element,
  access: string,
}

export const dashboardRoutes = [
  { name: "overview", title: 'Overview', link: '/admin', icon: <Grid2X2 className="h-4 w-4" />, access: 'businesscontrol' },
  { name: "bookings", title: 'Bookings', link: '/admin/bookings', icon: <BookCheck className="h-4 w-4" />, access: 'businesscontrol' },
  { name: "sales", title: 'Sales', link: '/admin/sales', icon: <Coins className="h-4 w-4" />, access: 'businesscontrol' },
  // { name: "base", title: 'Base packages', link: '/admin/base', icon: <Package2 className="h-4 w-4" />, access: 'businesscontrol' },
  { name: "schedules", title: 'Default schedules', link: '/admin/schedules', icon: <Calendar className="h-4 w-4" />, access: 'businesscontrol' },
  // { name: "types", title: 'Package types', link: '/admin/types', icon: <Shapes className="h-4 w-4" />, access: 'businesscontrol' },
  // { name: "features", title: 'Features & Services', link: '/admin/features', icon: <KeySquare className='h-4 w-4' />, access: 'businesscontrol' },
  { name: "coupons", title: 'Coupons', link: '/admin/coupons', icon: <TicketPercent className='h-4 w-4' />, access: 'businesscontrol' },

  { name: "overview", title: 'Overview', link: '/admin/systemcontrol', icon: <Grid2X2 className="h-4 w-4" />, access: 'systemcontrol' },
  { name: "performance", title: 'Performance/Maintenance', link: '/admin/systemcontrol/performance', icon: <Gauge className="h-4 w-4" />, access: 'systemcontrol' },
  { name: "reports", title: 'Problem reports', link: '/admin/systemcontrol/reports', icon: <Bug className="h-4 w-4" />, access: 'systemcontrol' },
  { name: "errors", title: 'System Error Logs', link: '/admin/systemcontrol/errors', icon: <ShieldAlert className="h-4 w-4" />, access: 'systemcontrol' },
  { name: "users", title: 'Users & Roles', link: '/admin/systemcontrol/users', icon: <UserCog className="h-4 w-4" />, access: 'systemcontrol' },

  { name: "breakpoint", title: '', link: '', icon: <Separator className="my-2" />, access: 'businesscontrol' },

  // { name: "logs", title: 'User Logs', link: '/admin/systemcontrol/logs', icon: <ClipboardList className="h-4 w-4" />, access: 'systemcontrol' },
  // { name: "analytics", title: 'Analytics', link: '/admin/systemcontrol/analytics', icon: <AreaChart className="h-4 w-4" />, access: 'systemcontrol' },

  { name: "inbox", title: 'Inbox', link: '/admin/inbox', icon: <Inbox className='h-4 w-4' />, access: 'businesscontrol' },
  { name: "clients", title: 'Clients', link: '/admin/users', icon: <User className='h-4 w-4' />, access: 'businesscontrol' },
  { name: "analytics", title: 'Analytics', link: '/admin/analytics', icon: <AreaChart className='h-4 w-4' />, access: 'businesscontrol' },

  // system base admin
  // { name: "breakpoint", title: '', link: '', icon: <Separator className="my-2" />, access: 'systemcontrol' },
  { name: "profile", title: 'Profile', link: '/admin/systemcontrol/profile', icon: <CircleUserRound className="w-4 h-4" />, access: 'systemcontrol' },
  { name: "settings", title: 'System Settings', link: '/admin/systemcontrol/devs', icon: <Settings2 className="h-4 w-4" />, access: 'systemcontrol' },
  // { name: "about", title: 'About', link: '/admin/systemcontrol/reports', icon: <AlertCircle className="h-4 w-4" />, access: 'systemcontrol' },
]

const salesRoutes = [
  { name: "bookings", title: 'Bookings', link: '/admin/sales', icon: <Grid2X2 className="h-4 w-4" />, access: 'businesscontrol' },
  { name: "Packages", title: 'Packages', link: '/admin/sales/packages', icon: <Package2 className="h-4 w-4" />, access: 'businesscontrol' },
  { name: "Features/Services", title: 'Features/Services', link: '/admin/sales/features', icon: <Package2 className="h-4 w-4" />, access: 'businesscontrol' },
]

const settingsRoutes = [
  { name: 'user', title: 'User profile', link: '/admin/settings', icon: <UserCog className="h-4 w-4" />, access: 'businesscontrol' },
  { name: 'reservation', title: 'Reservation settings', link: '/admin/settings/reservation', icon: <FolderCog className="h-4 w-4" />, access: 'businesscontrol' },
  { name: 'payments', title: 'Payments settings', link: '/admin/settings/payments', icon: <Banknote className="h-4 w-4" />, access: 'businesscontrol' },
  { name: 'website', title: 'Website settings', link: '/admin/settings/website', icon: <Cog className="h-4 w-4" />, access: 'businesscontrol' },
  { name: 'system', title: 'System settings', link: '/admin/settings/system', icon: <FileSliders className="h-4 w-4" />, access: 'systemcontrol' },
]

export const subroutes: SubRouteCollectionType[] = [
  { route: "admin", routes: dashboardRoutes },
  { route: "sales", routes: salesRoutes },
  { route: "settings", routes: settingsRoutes },
]