'use client'



import { useState } from 'react';
import './style.css';
import { Input } from '@/app/components/ui/input';
import { Check, Trash2 } from 'lucide-react';
import { useCustomPackage } from '../provider';
import { Empty } from 'antd';
import clsx from 'clsx';

export default function PackageInclusion() {

  // values
  const {
    inclusions,
    setInclusions
  } = useCustomPackage()
  const [offer, setOffer] = useState<string>("")
  const [onEdit, setOnEdit] = useState<number | undefined>()

  const setCurrentOffer = () => {
    if (onEdit) {
      const editedInclusions = inclusions.map((item, i) => {
        if (i == onEdit) return offer
        return item
      })
      setInclusions(editedInclusions)
      setOffer("")
      setOnEdit(undefined)
      return
    }
    setInclusions((prev) => [...prev, offer])
    setOffer("")
  }

  const removeToInclusions = (item: string) => {
    setInclusions((prev) => prev.filter((x) => x != item))
  }

  return (
    <div className="w-full h-[50vh] p-4 bg-white">
      <div className="w-full flex justify-between">
        <p className="font-semibold">This package offers:</p>
        <Input
          className='w-[200px]'
          placeholder="write inclusions..."
          value={offer}
          onChange={(e) => {
            setOffer(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              setCurrentOffer()
              e.preventDefault()
            }
          }}
        />
      </div>
      <div className={clsx("w-full gap-x-4 py-4", {
        "grid grid-cols-4": inclusions.length > 0,
        "flex items-center justify-center": inclusions.length == 0
      })}>
        {
          inclusions.map((item, i) => (
            <div className="flex gap-2 cursor-pointer group" key={i}>
              <Trash2 className="text-red-500 h-5 w-5 hidden group-hover:block" onClick={() => removeToInclusions(item)} />
              <Check className="text-green-500 h-5 w-5 block group-hover:hidden" />
              <p className="text-sm" onClick={() => {
                setOnEdit(i)
                setOffer(item)
              }}>{item}</p>
            </div>
          ))
        }
        {
          inclusions.length == 0 && (
            <Empty
              description="No inclusion, please add at least 4!"
            />
          )
        }
      </div>
      <div className="text-center text-sm">
        <p>Click trash icon to delete, click the item to edit.</p>
      </div>
    </div >
  )
}