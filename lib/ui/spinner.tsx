import clsx from 'clsx';
import './spinner.css'

export default function Spinner({ mode }: { mode?: string }) {
  return (
    <div className='flex justify-center items-center'>
      <div className={clsx("spinner", mode)}></div>
    </div>
  );
}