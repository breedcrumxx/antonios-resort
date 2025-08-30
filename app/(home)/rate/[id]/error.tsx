'use client'
import { Result } from 'antd'
import Link from 'next/link'
export default function ErrorPage() {

  return (
    <Result
      status="500"
      title="500"
      subTitle="An error occured while processing your request, please try again later!"
      extra={<Link href="/" className='px-4 py-2 bg-prm hover:text-white font-semibold text-white rounded-sm'>Back Home</Link>}
    />
  )
}