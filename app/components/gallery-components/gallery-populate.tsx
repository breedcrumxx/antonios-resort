"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "./gallery-card";

// ASSETS
import banner from '@/public/cta-banner.jpg';
import hero from '@/public/hero-img.jpg';
import sample from '@/public/sample-1.jpg';

const items = [
  'Be on the wall.',
  hero,
  sample,
  banner,
  hero,
  sample,
  banner,
  hero,
]

export default function GalleryContent() {
  return (
    <>
      {
        items.map((item, index) => {
          return (
              <CardContainer key={index} className="inter-var h-[25vh] w-full">
                <CardBody className="relative group/card h-full w-full">
                  <CardItem translateZ="100" className="w-full h-full">
                  {
                    typeof item == 'string' ? (
                        <div className="h-full w-full bg-gray-300 flex justify-center items-center">
                          <p>{item}</p>
                        </div>
                    ) : (
                        <Image src={item} alt="" className="h-full object-cover"/>
                    )
                  }
                  </CardItem>
                </CardBody>
              </CardContainer>
          )
        })
      }
    </>
  );
}
