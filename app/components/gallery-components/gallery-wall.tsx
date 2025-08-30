import GalleryContent from './gallery-populate';

export default function GalleryWall() {
    return (
        <div className="grid grid-cols-4 gap-5">
            <GalleryContent />
            {/* <div className='border-2 bg-black h-[25vh]'></div>
            <div className='border-2 bg-black h-[25vh]'></div>
            <div className='border-2 bg-black h-[25vh]'></div>
            <div className='border-2 bg-black h-[25vh]'></div>
            <div className='border-2 bg-black h-[25vh]'></div>
            <div className='border-2 bg-black h-[25vh]'></div> */}
        </div>
    )
}