
import { useSideBar } from './provider';
import clsx from 'clsx';
import Link from 'next/link';

export function HeaderLinks() {

  const pages = [
    { title: 'Dashboard', link: '/admin', newtab: false },
    { title: 'Scan', link: '/scan', newtab: true },
    { title: 'Settings', link: '/admin/settings', newtab: false },
  ]

  const { activeRoute } = useSideBar()

  return (

    <div className='flex space-x-1 text-sm font-medium'>
      {
        pages.map((item: { title: string, link: string, newtab: boolean }, index: number) => (
          <Link
            target={item.newtab ? "_blank" : ""}
            className={clsx('text-black cursor-pointer py-1 px-2 rounded-[5px] hover:bg-gray-200/50 hover:text-black', { 'text-gray-400': activeRoute != item.title.toLowerCase() }, { 'bg-black text-white': activeRoute == item.title.toLowerCase() })}
            href={item.link}
            prefetch={true}
            key={index}>
            {item.title}
          </Link>
        ))
      }
    </div>
  )
}
