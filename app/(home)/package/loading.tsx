
import { logo } from "@/lib/configs/config-file"

export default function Loading() {

  return (
    <div className="relative h-0">
      <div
        className="absolute top-0 left-0 min-w-screen min-h-screen flex items-center justify-center z-[100] -translate-y-[4rem] relative bg-white pointer-events-none">
        {/* <Spinner label="Welcome to Antonio's Resort" /> */}
        <img src={logo} alt="company-logo" className="animate-test  h-[150px] w-[150px]" />
      </div>
    </div>
  )
}