import { Spinner } from "@nextui-org/spinner";

export default function Loading() {

  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      <Spinner label="Loading, please wait..." />
    </div>
  )
}