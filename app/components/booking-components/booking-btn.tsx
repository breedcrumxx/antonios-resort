'use client';

import { useRouter } from "next/navigation";

export default function BookingBtn() {

    const router = useRouter();

    const handleClick = () => {
        router.push('package');
    }

    return (
        <button className={"col-gold w-auto px-14 py-2 text-white mt-5"} onClick={() => handleClick()}>BOOK NOW</button>
    )
}