import { create } from 'zustand'
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

export type PackageFilterType = {
  headcount: number,
  days: number,
  date: Date | undefined,
  type: string,
}

// type PackageDataStore = {
//   store: Data
// }

// type StoreActionType = {
//   updateStore: (data: Partial<Data>) => void
// }

// type PackageStoreType = PackageDataStore & StoreActionType

// const packageStore = create<PackageStoreType>((set) => ({
//   store: {
//     headcount: 1,
//     days: 1,
//     date: undefined,
//     type: '',
//   },
//   updateStore: (part: Partial<Data>) => {
//     set((state) => ({ ...state, store: { ...state.store, ...part } }))
//   },
// }))

const initialData = {
  headcount: 1,
  days: 1,
  date: undefined,
  type: '',
}

export const packageStore = new Store<PackageFilterType>(initialData);

export const setPackageStore = (part: Partial<PackageFilterType>) => {
  packageStore.setState((state) => {
    return {
      ...state,
      ...part,
    }
  })
}

export const usePackageStore = () => {
  const reset = () => {
    setPackageStore(initialData)
  }

  const store = useStore(packageStore, (state) => state)
  return { ...store, reset }
}

