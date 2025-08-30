'use client'

import { logo } from '@/lib/configs/config-file';
import eventcenter from '@/public/home-src/event-center.jpg';
import dynamic from 'next/dynamic';
const FlipWords = dynamic(() => import('@/app/components/ui/flip-words'), {
  ssr: false
})

export default function EventCenterSection() {

  const words = ["Reunion?", "Debut?"]

  return (
    <div className="w-full flex justify-center">
      <div className="w-full px-2 sm:px-0 sm:w-[900px] sm:py-24 sm:flex sm:gap-5">
        <div className='w-full space-y-4 sm:w-1/3 h-inherit flex flex-col justify-between py-5'>
          <span className="text-3xl font-normal text-center sm:text-left">
            Finding a venue<br />
            for your<br className="block sm:hidden" /><FlipWords className="text-prm" words={words} />
          </span>
          <div className="block sm:hidden w-full">
            <img
              className="w-full h-auto"
              src={eventcenter.src} alt="event-center" />
          </div>
          <div className='w-full'>
            <img
              height={150}
              width={150}
              className='hidden sm:block mx-auto'
              src={logo} alt="" />
            <h1 className="font-semibold text-2xl elegant text-center">AR EVENT CENTER</h1>
            <br />
            <p className="text-sm text-center sm:text-left">
              Let us help make your event great! With AR Event Center, a place for all kinds of events, big or small. It&apos;s a comfortable and well-equipped venue, perfect for making your special moments unforgettable.
            </p>
          </div>
        </div>
        <div className="hidden sm:block w-2/3">
          <img
            className="w-full h-auto"
            src={eventcenter.src} alt="event-center" />
        </div>
      </div>
    </div>
  )
}