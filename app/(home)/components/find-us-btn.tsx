'use client'

import { Button } from "@/app/components/ui/button";

export default function FindUsBtn() {

  const handleOpenMaps = () => {
    window.open("https://www.google.com/maps/place/Antonio's+Resort/@15.3625766,121.0365595,18.25z/data=!4m14!1m7!3m6!1s0x339725305618f725:0xa4eec494aff18a3a!2sAntonio's+Resort!8m2!3d15.3626781!4d121.0356162!16s%2Fg%2F11s5931gx0!3m5!1s0x339725305618f725:0xa4eec494aff18a3a!8m2!3d15.3626781!4d121.0356162!16s%2Fg%2F11s5931gx0?hl=en&entry=ttu&g_ep=EgoyMDI0MDkxMS4wIKXMDSoASAFQAw%3D%3D", '_blank')
  };

  return (
    <Button
      className="px-20 text-black"
      variant={"outline"}
      onClick={() => handleOpenMaps()}
    >FIND US</Button>
  )
}