import { Result } from "antd";
import Link from "next/link";

export default function Restricted() {
  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Result
        className="w-[50vw]"
        status="403"
        title={"Restricted"}
        subTitle={"You are not allowed to access this page!"}
        extra={
          <Link href="/" className='px-4 py-2 bg-prm hover:text-white font-semibold text-white rounded-sm'>Back Home</Link>
        }
      />
    </div>
  )
}