import { Spinner } from "@nextui-org/spinner";

export default function Loading() {
  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center space-y-5">
        <Spinner />
        <p>Loading, please wait...</p>
      </div>
    </div>
  )
}