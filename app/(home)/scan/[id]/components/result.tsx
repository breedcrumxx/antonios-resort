'use client'

import { Result } from "antd"
import { useStatement } from "../statement-provider"
import RouterBtn from "./router-btn"

export default function ResultComponent() {

  // context
  const { statement } = useStatement()

  return (
    <>
      <Result
        status="success"
        title="Checked-in successfully!"
        subTitle={statement}
        extra={<RouterBtn link={'/scan'} label="Scan another booking" className="bg-prm" key={0} />}
      />
    </>
  )
}