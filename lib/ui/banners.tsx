import Image from 'next/image'
import error_light from '@/public/error-dark.svg'

export function BadRequestBanner() {
  return (
    <>
      <div className="text-center py-5">
        <h1 className="text-4xl font-semibold text-red-500">We Did Not Expect That!</h1>
        <p className="mt-5 ">There&apos;s a problem with your request. Is it you? <span className="text-blue-500 underline cursor-pointer">Retry</span></p>
        <p className="">If it&apos;s not you who made this request, Please make a <span className="text-blue-500 underline cursor-pointer">Report.</span> </p>
      </div>
    </>
  )
}

export function SomethingWentWrongBanner() {
  return (
    <div className="text-white h-full flex justify-center items-center min-h-[400px]">
      <Image src={error_light} alt='Error' className='max-w-[100px]' />
      <div>
        <h1 className="text-4xl">Oops! Something went wrong.</h1>
        <p className="text-lg text-gray-400">If you continue to experience problems, please  don&apos;t hesitate to <span className="text-blue-500 cursor-pointer underline">Contact Support Team.</span> </p>
      </div>
    </div>
  )
}
