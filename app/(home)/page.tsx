import ImageSlider from "./components/image-slider/image-slider";

// ASSETS
import '@/app/style.css';
import { logo } from "@/lib/configs/config-file";
import cta from '@/public/home-src/cta.jpg';
import def1 from '@/public/home-src/def-1.jpg';
import def2 from '@/public/home-src/def-2.jpg';

import nom1 from '@/public/home-src/nom1.jpg';
import sld1 from '@/public/home-src/sld1.jpg';
import sld2 from '@/public/home-src/sld2.jpg';
import sld3 from '@/public/home-src/sld3.jpg';
import flat1 from '@/public/home-src/villa-interior.jpg';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from "next/link";
import EventCenterSection from "./components/event-center-section";
import FAQSection from "./components/faq-section";
import { FeatureSection } from "./components/feature-component/feature-section";
import FindUsBtn from "./components/find-us-btn";
import ParalaxEnding from "./components/paralax-ending";
const PublicSwimmingSection = dynamic(() => import("./components/public-swimming-section"), {
  ssr: false
})

export default function Home() {

  return (
    <>
      <ImageSlider />
      <div className="min-w-screen max-w-screen relative">
        <div className="h-max sm:h-[100vh] relative w-full snap-center bg-transparent">
          <img
            src={nom1.src}
            alt=""
            className="opacity-0 inset-0 w-full h-full object-cover object-center"
          />
        </div>

        <div className="min-w-screen flex flex-col items-center bg-white">
          <div className="home w-full sm:space-y-4 sm:w-[900px] py-10 relative">
            <div className="w-full px-5 sm:px-0 sm:flex sm:items-center sm:justify-between">
              <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] mx-auto sm:mx-0 bg-gray-500 overflow-hidden relative">
                <Image
                  className="aspect-auto object-cover"
                  src={def1.src}
                  loading="lazy"
                  alt="default-1"
                  fill
                />
              </div>
              <br className="block sm:hidden" />
              <div className="w-full text-center sm:text-left sm:w-1/2">
                <h1 className="font-semibold text-4xl elegant">Welcome to Antonio&apos;s</h1>
                <p>Picture a place where you&apos;re welcomed like family from the moment you step in. A peaceful spot where you can relax, enjoy nature, and feel truly cared for. Whether you&apos;re here to unwind or celebrate, Antonio&apos;s is here to make your stay special and comfortable.</p>
              </div>
            </div>
            <br className="block sm:hidden" />
            <div className="w-full flex flex-col-reverse px-5 sm:px-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full space-y-2 sm:w-1/2 text-center">
                <h1 className="elegant text-2xl font-semibold">What We Are?</h1>
                <p>At Antonio&apos;s, we are a family-friendly resort that offers a relaxing escape from the busy city life. Our goal is to provide a welcoming and comfortable place for you to unwind and enjoy nature.
                </p>
                <br />
                <h1 className="elegant text-2xl font-semibold ">What We Do?</h1>
                <p>We offer a range of services to make your stay special, including comfortable accommodations, delicious meals, and fun activities for all ages. Whether you&apos;re here for a vacation or a special event, we focus on making your time with us enjoyable and memorable.</p>
              </div>
              <br className="block sm:hidden" />
              <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] mx-auto sm:mx-0 bg-gray-500 overflow-hidden relative">
                <Image
                  className="aspect-auto"
                  src={def2.src}
                  loading={"lazy"}
                  alt="default-1"
                  fill
                />
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center py-10 bg-orange-100/30">
            <div className="w-full space-y-16 px-5 sm:px-0 sm:w-[900px] sm:space-y-0">
              <div className="w-full flex items-center space-x-4 py-0 sm:py-4">
                <div className="flex-grow h-[1px] border"></div>
                <p className="elegant text-md sm:text-xl uppercase tracking-wider">Explore offers of antonio&apos;s</p>
                <div className="flex-grow h-[1px] border"></div>
              </div>
              <div className="block space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                <div className="w-full flex flex-col sm:w-1/3 space-y-2">
                  <div className="w-full h-auto aspect-square relative overflow-hidden">
                    <Image
                      className="aspect-auto object-cover"
                      src={sld2.src}
                      fill
                      alt="" />
                  </div>
                  <h1 className="font-semibold text-center elegant text-xl">POOL AND COTTAGES</h1>
                  <p className="text-sm">Relax and unwind at Antonio&apos;s Resort with our inviting pool and cozy cottages, perfect for cooling off on a hot day or enjoying a weekend hangout with family and friends. Whether you&apos;re here for a swim or a peaceful retreat, we have the ideal spot for your getaway.</p>
                  <br />
                  <div className="flex-grow"></div>
                  <Link
                    href="/package?type=cottage"
                    className="uppercase font-regular tracking-wider text-sm text-right hover:underline cursor-pointer"
                    prefetch
                  >See more</Link>
                </div>

                <div className="w-full flex flex-col sm:w-1/3 space-y-2">
                  <div className="w-full h-auto aspect-square relative overflow-hidden">
                    <Image
                      className="aspect-auto object-cover"
                      src={sld3.src}
                      fill
                      alt="" />
                  </div>
                  <h1 className="font-semibold text-center elegant text-xl">AR VILLAS</h1>
                  <p className="text-sm">Relax in the comfort of our AR Villas, offering hotel-style rooms for your getaway. Whether you&apos;re here for an adventure or a peaceful retreat, our villas provide the perfect stay.</p>
                  <br />
                  <div className="flex-grow"></div>
                  <Link
                    href="/package?type=villa"
                    className="uppercase font-regular tracking-wider text-sm text-right hover:underline cursor-pointer"
                    prefetch
                  >See more</Link>
                </div>

                <div className="w-full flex flex-col sm:w-1/3 space-y-2">
                  <div className="w-full h-auto aspect-square relative overflow-hidden">
                    <Image
                      className="aspect-auto object-cover"
                      src={sld1.src}
                      fill
                      alt="" />
                  </div>
                  <h1 className="font-semibold text-center elegant text-xl">EVENTS AT ANTONIO&apos;S</h1>
                  <p className="text-sm">Host your next unforgettable event at Antonio&apos;s Resort, where our spacious event hall offers the perfect venue for celebrations, corporate gatherings, and special occasions. With stunning surroundings and top-notch amenities, we ensure every detail is tailored to your needs, making your event truly memorable.</p>
                  <br />
                  <div className="flex-grow"></div>
                  <Link
                    href="/package?type=event"
                    className="uppercase font-regular tracking-wider text-sm text-right hover:underline cursor-pointer"
                    prefetch
                  >See more</Link>
                </div>
              </div>
            </div>
          </div>

          <PublicSwimmingSection />

          <div className="w-full flex justify-center">
            <div className="w-full px-4 py-10 block bg-orange-100/30 sm:px-0 sm:w-[900px] sm:bg-white sm:flex sm:py-24 sm:gap-10">
              <div className="w-full sm:w-2/3 space-y-2">
                <div className="w-full h-auto relative overflow-hidden">
                  <img src={flat1.src} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              <br className="block sm:hidden" />
              <div className="w-full sm:w-1/3 flex flex-col justify-center relative">
                <Image
                  className="hidden sm:block w-1/2 h-auto aspect-square mx-auto"
                  src={logo}
                  height={150}
                  width={150}
                  alt="" />
                <h1 className="font-semibold text-2xl elegant text-center">VILLA GRANDE</h1>
                <br />
                <p className="text-sm text-center sm:text-left">
                  Discover the ultimate in luxury at Antonio&apos;s with Villa Grande, our most spacious and prestigious villa. Perfect for large groups or special occasions, this villa offers unmatched comfort and elegance.
                </p>
              </div>
            </div>
          </div>

          <EventCenterSection />

          <FeatureSection />
          <FAQSection />
        </div>

        <ParalaxEnding />

        <div className="min-w-screen h-[50vh] sm:h-auto relative">
          <img src={cta.src} alt="" className="h-full w-auto object-cover aspect-auto sm:w-full" />
          <div className="layer-content absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-white z-10 pb-10">
            <div className="flex-grow"></div>
            <section className="text-center">
              <div className="w-full min-h-[300px] sm:px-48 flex flex-col items-center justify-center space-y-4">
                <p className="text-4xl uppercase">Find your way to our doors.</p>
                <FindUsBtn />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
