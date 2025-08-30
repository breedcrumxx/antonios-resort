
import { options } from '@/app/api/auth/[...nextauth]/options';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import FilterProvider from '../sales/components/provider';
import AnnualBookingGraph from './analytics/components/annual-booking-graph';
import DashboardQuickLinks from './components/dashboard-quicklinks';
import RenderNewChats from './components/render-new-chats';
import WeeklyBookings from './components/weekly-bookings';

export default async function Overview() {

	const session = await getServerSession(options)

	const headersList = headers();
	const header_url = headersList.get('x-url') || "";

	if (!session) {
		redirect(`/admin/signin?callback=${header_url}`)
	}

	const user = session.user as UserSession

	if (user.role.systemcontrol) { // if the user is the system admin, redirect to system controls
		redirect("/admin/systemcontrol")
	}

	return (
		<FilterProvider>
			<div className='w-full h-full flex'>
				<div className="w-3/4 flex-grow overflow-y-scroll scroll p-4 space-y-4">
					<div>
						<h1 className="text-xl font-bold">Welcome back, {user.name}</h1>
						<p className="text-gray-500 text-sm">Check the latest updates to your reservations</p>
					</div>
					<div className="w-full">
						<DashboardQuickLinks />
					</div>
					<AnnualBookingGraph />
					<Card className="h-max">
						<CardHeader className="relative">
							<CardTitle className="text-gray-500 text-lg">Bookings for this week</CardTitle>
						</CardHeader>
						<CardContent>
							<WeeklyBookings />
						</CardContent>
					</Card>
				</div>
				<div className="w-1/4 h-full p-4 flex flex-col border-l-[1px]">
					<div className="w-full h-full flex flex-col py-2">
						<h1 className="text-sm font-semibold text-gray-500">Chats</h1>
						<RenderNewChats />
					</div>
				</div>
			</div>
		</FilterProvider>
	)
}