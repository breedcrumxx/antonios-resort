'use client'

import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { ChangeEvent, useState } from 'react'
import { useCheckout } from '../provider'

export default function AgreementDialog({ openAgreement, setOpenAgreement, setAgreement }: { openAgreement: boolean, setOpenAgreement: (call: boolean) => void, setAgreement: (call: boolean) => void }) {

  // content
  const { agreementContent } = useCheckout()

  // states
  const [checked, setChecked] = useState<boolean>(false)

  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }

  const saveAndContinue = () => {
    setAgreement(true)
    setOpenAgreement(false)
  }

  return (
    <Dialog open={openAgreement} onOpenChange={() => setOpenAgreement(false)}>
      <DialogContent className='max-h-[90vh] min-w-[90vw] max-w-[90vw] p-0 flex flex-col'>
        <DialogHeader className='p-6'>
          <DialogTitle>RULES AND USER AGREEMENT</DialogTitle>
          <DialogDescription>PLEASE READ CAREFULLY. BY CHECKING THE BOX BELOW, YOU ACKNOWLEDGE AND AGREE TO THE TERMS OF ANTONIO&apos;s RESORT.</DialogDescription>
        </DialogHeader>
        <ScrollArea className='h-[1000px] w-full'>
          <div className='h-max w-full space-y-2 px-5 pb-5 text-justify' dangerouslySetInnerHTML={{ __html: agreementContent.content }}>
          </div>
          <div className='flex items-center px-5 gap-2'>
            <Input onChange={handleChecked} type='checkbox' className='max-h w-4' />
            <p>I have read and understood the user agreement. By checking the box, I acknowledge and agree to the terms and conditions outlined above.</p>
          </div>
        </ScrollArea>
        <DialogFooter className='px-5 pb-5'>
          <Button className='bg-prm px-6' disabled={!checked} onClick={() => saveAndContinue()}>Agree and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}