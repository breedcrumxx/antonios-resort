import { Spinner } from "@nextui-org/spinner";

export default function LoadingPage() {

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center">
      <Spinner label="Loading, please wait..." />
    </div>
  )

}