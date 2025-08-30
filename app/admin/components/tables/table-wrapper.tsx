'use client'

import { useReload } from "@/app/providers/reloader"
import { message } from "antd"
import { useEffect, useState } from "react"
import { usePagination } from "../pagination/provider"
import { FlexTable } from "./table"

interface WrapperProps {
  api: string
  columns: any
  searchRef: string
  callToAdd?: () => void
  addlabel?: string
  hidden?: any | {}
  disableadd?: boolean
  disablesearch?: boolean
  filtercomponent?: JSX.Element,
  searchfiltercomponent?: JSX.Element,
  defaultpagination?: boolean,
  getTableInstance?: (table: any) => void
  setDataCount?: (value: number) => void
}

export default function TableWrapper(props: WrapperProps) {

  const { reload, setReload } = useReload()
  const { setMaxPage, setPage } = usePagination()
  const {
    api,
    columns,
    hidden,
    searchRef,
    callToAdd = () => { },
    addlabel,
    disableadd,
    disablesearch,
    filtercomponent,
    searchfiltercomponent,
    defaultpagination = false,
    setDataCount = (value: number) => { },
    getTableInstance,
  } = props

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any[]>([])
  const controller = new AbortController()
  const signal = controller.signal

  useEffect(() => {
    if (reload) {
      setMaxPage(0)
      setPage(1)
      setError(false)
      setLoading(true)
      fetchData(signal)
    }
  }, [reload])

  useEffect(() => {
    console.log(api)
    setLoading(true)
    fetchData(signal)

    return () => {
      controller.abort()
    }
  }, [api])

  const fetchData = async (signal: any) => {
    try {

      const response = await fetch('/api' + api, { method: 'GET', signal })
      if (response.status == 500) {
        throw new Error(`Error fetching data!`);
      }
      if (response.status == 204 || response.status == 404) {
        setReload(false)
        setLoading(false)
        return
      }

      const result = await response.json()

      if (defaultpagination) {
        setData(result)
      } else {
        setData(result.data)
        setMaxPage(result.maxpage)
      }

      if (result.hasOwnProperty('datacount')) {
        setDataCount(result['datacount'])
      }

    } catch (error) {
      if (error instanceof Error && error.message == "signal is aborted without reason") {
        setReload(false)
        setLoading(false)
        return
      }
      message.error("Unable to fetch data, please try again later!")
      setError(true)
    }

    setReload(false)
    setLoading(false)
  }

  const handleAdd = () => {
    callToAdd()
  }

  return (
    <>
      <FlexTable
        data={data}
        columns={columns}
        hiddenfields={hidden}
        loading={loading}
        error={error}
        searchRef={searchRef}
        callToAdd={handleAdd}
        addlabel={addlabel}
        disableAdd={disableadd}
        disableSearch={disablesearch}
        filtercomponent={filtercomponent}
        searchfiltercomponent={searchfiltercomponent}
        defaultpagination={defaultpagination}
        getTableInstance={getTableInstance}
      />
    </>
  )
}