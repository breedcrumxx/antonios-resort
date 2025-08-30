import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { useEffect, useState } from "react";

export default function CoolDownDialog({
  open,
  close,
  title,
  description,
  accept,
  cooldown = 5,
  body,
  isNode,
  isContent,
  cancel,
  proceed,
  proceedstyle,
  proceedvariant,
  fallback,
}: {
  open: boolean,
  close: () => void,
  title: string | React.ReactNode,
  description: string | React.ReactNode,
  accept: () => void,
  cooldown?: number,
  body?: React.ReactNode,
  isNode?: boolean,
  isContent?: boolean,
  cancel?: string,
  proceed?: string,
  proceedstyle?: string,
  proceedvariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined,
  fallback?: boolean
}) {

  // states
  const [countdown, setCountdown] = useState<number>(cooldown)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <>
      {
        isContent ? (
          <>
            {
              isNode ? (
                <>
                  {title}
                  {description}
                </>
              ) : (
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
              )
            }
            {body}
            <DialogFooter>
              <Button variant="outline" onClick={() => close()}>{cancel ? cancel : "Abort"}</Button>
              <Button variant={proceedvariant ? proceedvariant : "destructive"} disabled={countdown > 0} onClick={() => accept()}>{countdown > 0 ? `(${countdown})` : ""} {proceed ? proceed : "Yes, continue"}</Button>
            </DialogFooter>
          </>
        ) : (
          <Dialog open={open}>
            <DialogContent disableclose enablex={false}>
              {
                isNode ? (
                  <>
                    {title}
                    {description}
                  </>
                ) : (
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                  </DialogHeader>
                )
              }
              {body}
              <DialogFooter>
                {
                  fallback ? (
                    <Button className={proceedstyle} onClick={() => close()}>Understood</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => close()}>{cancel ? cancel : "Abort"}</Button>
                      <Button className={proceedstyle} variant={proceedvariant ? proceedvariant : "destructive"} disabled={countdown > 0} onClick={() => accept()}>{countdown > 0 ? `(${countdown})` : ""} {proceed ? proceed : "Yes, continue"}</Button>
                    </>
                  )
                }
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }
    </>
  )
}