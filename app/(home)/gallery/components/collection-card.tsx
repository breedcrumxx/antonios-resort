import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { collection } from "@/lib/zod/z-schema"
import { useRouter } from "next/navigation"
import { z } from "zod"

export default function CollectionCard({ item }: { item: z.infer<typeof collection> }) {

  const router = useRouter()

  router.prefetch(`/gallery/${item.id}`)

  const viewCollection = (item: z.infer<typeof collection>) => {
    const stringitem = JSON.stringify(item)
    localStorage.setItem("view", stringitem)
    router.push(`/gallery/${item.id}`)
  }

  return (
    <Card className="flex flex-col p-4 hover:bg-muted/40 cursor-pointer hover:scale-[1.01] transition-all" onClick={() => viewCollection(item)}>
      <CardContent className="flex-grow flex p-0 pb-4 gap-2 overflow-hidden">
        {
          item.images.length < 4 ? (
            <div className="relative w-full h-full rounded-sm overflow-hidden">
              <img src={item.images[0]} alt="img-thumbnail" className="w-full h-full object-cover" />
            </div>
          ) : item.images.length == 4 ? (
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[2]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[3]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <img src={item.images[2]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <div className="absolute h-full w-full flex justify-center items-center top-0 left-0 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 z-10 rounded-sm">
                  <p className="text-white font-bold text-xl">+ {item.images.length - 3}</p>
                </div>
                <img src={item.images[3]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )
        }
      </CardContent>
      <CardHeader className="p-0 pt-4">
        <CardTitle className="w-full truncate text-lg">{item.collectionname}</CardTitle>
        <CardDescription className="w-full truncate">{item.collectiondescription}</CardDescription>
      </CardHeader>
    </Card>
  )
}