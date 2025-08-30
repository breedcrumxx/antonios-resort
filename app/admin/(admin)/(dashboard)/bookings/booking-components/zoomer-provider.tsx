'use client'

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import React, { createContext, useContext, useEffect, useState } from "react"

const ZoomerContext = createContext<any>(null)

export default function ZoomerContextProvider({ children, skip = false }: { children: JSX.Element, skip?: boolean }) {

  const zoomRef = React.useRef(null);

  // states
  const [zoom, setZoom] = useState<boolean>(false)
  const [initial, setInitial] = useState<boolean>(true)
  const [image, setImage] = useState<string>("")

  useEffect(() => {
    const body = document.querySelector('body') as HTMLBodyElement
    if (skip) return
    if (initial && !zoom) { // return
      return
    }
    if (zoom) { // remove the body pointer events
      body.style.pointerEvents = 'auto'
      setInitial(false)
    }
    if (!zoom && !initial) { // close and not initial
      // return the pointer events
      body.style.pointerEvents = 'none'
      return
    }
  }, [zoom, initial])

  return (
    <ZoomerContext.Provider value={{
      zoom,
      setZoom,
      setImage,
    }}>
      <Lightbox
        // className="pointer-events-auto z-100"
        index={0}
        plugins={[Zoom]}
        zoom={{ ref: zoomRef }}
        styles={{ navigationPrev: { display: 'none' }, navigationNext: { display: 'none' } }}
        slides={[{ src: image }]}
        open={zoom}
        close={() => setZoom(false)}
      />
      {children}
    </ZoomerContext.Provider>
  )
}

export const useZoom = () => {
  return useContext(ZoomerContext)
}