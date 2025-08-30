'use client'

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "./debounce";

export const useFetch = <T,>(url: string, defaultvalue?: T, debounce?: boolean) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false)

  if (debounce) {
    url = useDebounce(url, 500)
  }

  const controller = new AbortController()
  const signal = controller.signal

  const getData = useCallback(async () => {

    setLoading(true);
    try {
      const res = await fetch(url, { method: "GET", signal });

      if (!res.ok) throw new Error()
      const json = await res.json();
      setData(json)

    } catch (error) {
      console.log(error)
      setError(true)
    }
    setLoading(false);

  }, [url]);

  useEffect(() => {
    getData();

    return () => {
      controller.abort()
    }
  }, [getData]);

  return { data, loading, error };
};
