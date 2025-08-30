'use client'

import { z } from "zod"
import { extendedcategory } from "../zod/z-schema"

export const handleDisplayables = (copy: z.infer<typeof extendedcategory>[]) => {
  // now handle the displayables
  let curr = 0
  let copyOfDisplayables: z.infer<typeof extendedcategory>[][] = [[], [], []]
  copy.forEach((item) => {
    copyOfDisplayables[curr].push(item)
    curr++
    if (curr == 3) curr = 0
  })
  return [...copyOfDisplayables]
}