import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useAction = <
  ReturnType,
  DataType = ReturnType extends { data: any } ? ReturnType['data'] : never,
>(
  action: () => Promise<ReturnType>,
  conditions: (
    result: ReturnType,
    set: Dispatch<SetStateAction<DataType | null>>,
    err: Dispatch<SetStateAction<boolean>>
  ) => void
) => {

  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const execute = async () => {
    setLoading(true);
    setError(false);

    const result = await action();
    setLoading(false)
    conditions(result, setData, setError)
  };

  useEffect(() => {
    execute(); // Execute on mount
  }, []);

  return { data, loading, error, retry: execute };
};
