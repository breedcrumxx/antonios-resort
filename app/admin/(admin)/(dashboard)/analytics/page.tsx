'use client'

import AnnualBookingGraph from './components/annual-booking-graph';
import FindingsPanel from './components/findings';
import MonthlyAgeDistribution from './components/monthly-age-distribution';
import RevenueLineGraph from './components/revenue-line-graph';
import UserDonut from './components/user-donut';
import UserEngagementChart from './components/user-engagement';
import { WebiteActivity } from './components/website-activity';

export default function AnalyticsPage() {

  return (
    <div className="h-max grid grid-flow-row auto-rows-[50px] grid-cols-4 gap-4 p-4 overflow-y-scroll scroll">
      <FindingsPanel />
      <UserDonut />
      <AnnualBookingGraph />
      <RevenueLineGraph />
      <UserEngagementChart />
      <WebiteActivity />
      <MonthlyAgeDistribution />
    </div>
  )
}