import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { cn } from '../utils';

interface FormErrorProps {
  message?: string;
  className?: string
}

export const FormError = ({
  message,
  className
}: FormErrorProps) => {
  if (!message) return null

  return (
    <div className={cn('p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive', className)} style={{
      backgroundColor: 'rgba(255, 99, 71, .15)'
    }}>
      <ExclamationTriangleIcon className='h-4 w-4' />
      <p>{message}</p>
    </div >
  )
}