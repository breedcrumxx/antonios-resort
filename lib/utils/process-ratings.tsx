import { ratingkeys } from "../zod/z-schema"
import z from 'zod'

export const processRatings = (data: z.infer<typeof ratingkeys>[]) => {

  const withvalues = data.map((item) => item.rating).filter((item): item is NonNullable<typeof item> => item != null)

  const packagerate = withvalues.reduce((a, b) => a + b.package, 0) / withvalues.length
  const servicerate = withvalues.reduce((a, b) => a + b.service, 0) / withvalues.length
  const qualityrate = withvalues.reduce((a, b) => a + b.quality, 0) / withvalues.length
  const valuerate = withvalues.reduce((a, b) => a + b.value, 0) / withvalues.length

  const avg = (packagerate + servicerate + qualityrate + valuerate) / 4

  return { packagerate, servicerate, qualityrate, valuerate, avg }
}