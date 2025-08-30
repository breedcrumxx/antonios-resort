'use client'

import { extendedpackageoffer } from '@/lib/zod/z-schema';
import { useQuery } from '@tanstack/react-query';
import { Empty, message } from 'antd';
import axios from 'axios';
import { add } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import z from 'zod';
import { setPackageStore, usePackageStore } from '../stores/package-store';
import CustomPackageFallBack from './custompackage-fallback';
import PackageCard from './package-card';
import PackageFilter from './package-filter';
import { PaginationControls } from './pagination';

export default function PackageRenderer({ user }: { user: UserSession | null }) {

  const searchParams = useSearchParams()
  const { headcount, type, days, date, reset } = usePackageStore()

  // states
  const [query, setQuery] = useState<string>("/api/packages/offers?page=1")
  const [page, setPage] = useState<number>(1)
  const [maxPage, setMaxPage] = useState<number>(0)

  useEffect(() => {
    if (searchParams.get('type')) {
      setPackageStore({ type: searchParams.get('type') || '' })
    }

    return () => {
      reset()
    }
  }, [])

  // values
  const [data, setData] = useState<z.infer<typeof extendedpackageoffer>[]>([])

  const { isPending, isLoading, isError } = useQuery({
    queryKey: ['query', query, page],
    queryFn: async () => {
      const response = await axios.get(`/api/packages/offers?page=${page}&heads=${headcount}${date ? `&range=${encodeURI(JSON.stringify({ from: date, to: add(date, { days: days - 1 }) }))}` : ""}${type.length > 0 ? `&type=${type}` : ''}`)
      setData(response.data.res)
      setMaxPage(response.data.maxpage)
      return null
    },
  })

  if (isError) {
    message.error("Internal server error, please try again later!")
  }

  const findPackage = () => {
    setQuery(`/api/packages/offers?page=${page}&heads=${headcount}${date ? `&range=${encodeURI(JSON.stringify({ from: date, to: add(date, { days: days - 1 }) }))}` : ""}${type.length > 0 ? `&type=${type}` : ""}`)
  }

  const getSelected = () => {
    // check if multiple units
    if (!date) return new Date()
    return { from: date, to: add(date, { days: days - 1 }) }
  }

  return (
    <div className="h-auto w-full space-y-2">
      <div className="w-full flex">
        <div className="hidden sm:block w-1/4"></div>
        <PaginationControls
          page={page}
          setPage={setPage}
          maxPage={maxPage}
          className=''
        />
      </div>
      <div className="w-full flex">
        <PackageFilter
          user={user}
          findPackage={findPackage}
          getSelected={getSelected}
        />
        <div className='w-full sm:w-3/4 px-4 space-y-2'>
          {
            isPending ? (
              <CustomPackageFallBack />
            ) : data.length == 0 ? (
              <Empty
                description="No result, try adjusting your search."
              />
            ) : (
              <>
                {
                  data.map((item, i) => (
                    <PackageCard
                      data={item}
                      key={i}
                    />
                  ))
                }
              </>
            )
          }
        </div>
      </div>
      <div className="w-full flex">
        <div className="hidden sm:block w-1/4"></div>
        <PaginationControls
          page={page}
          setPage={setPage}
          maxPage={maxPage}
          className=''
        />
      </div>
    </div>
  )
}
