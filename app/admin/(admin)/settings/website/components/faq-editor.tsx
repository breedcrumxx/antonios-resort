'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { FaqConfigType } from "@/lib/configs/config-file"
import { loadConfig } from "@/lib/configs/load-config"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { md5Checker } from "@/lib/utils/md5-checker"
import { message } from "antd"
import clsx from "clsx"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type FAQEditType = { id: number, question: string, answer: string }

export default function FAQEditor({ content }: { content: FaqConfigType }) {

  const router = useRouter()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [move, setMove] = useState<number>(-1)
  const [valueErrors, setValueErrors] = useState<{ input: boolean, textarea: boolean }>({ input: false, textarea: false })
  const [moveItem, setMoveItem] = useState<boolean>(false)

  // values
  const [values, setValues] = useState<FaqConfigType>(content)
  const [editValues, setEditValues] = useState<FAQEditType | null>()
  const [selectedItem, setSelectedItem] = useState<number>(-1)

  useEffect(() => {

    const selectingShortcuts = (event: KeyboardEvent) => {
      event.preventDefault()
      const min = 0
      const max = values.length - 1
      if (event.key == "ArrowUp" && move > min) {
        setMove((prev) => prev - 1)
      }
      if (event.key == "ArrowDown" && move < max) {
        setMove((prev) => prev + 1)
      }
      if (event.key == "Escape") {
        setMoveItem(false)
        setMove(-1)
      }
      if (event.key == "Enter") {
        setMoveItem(false)
        setMove(-1)
        setSelectedItem(move)
      }
    };

    const movingShortcuts = (event: KeyboardEvent) => {
      event.preventDefault()
      const min = 0
      const max = values.length - 1
      if (event.key == "ArrowUp" && selectedItem > min) {
        const copyValues = values
        const selectedValue = values[selectedItem]
        const swappedValue = values[selectedItem - 1]

        copyValues[selectedItem] = swappedValue
        copyValues[selectedItem - 1] = selectedValue

        setValues(([...copyValues]))
        setSelectedItem(selectedItem - 1)
      }
      if (event.key == "ArrowDown" && selectedItem < max) {
        const copyValues = values
        const selectedValue = values[selectedItem]
        const swappedValue = values[selectedItem + 1]

        copyValues[selectedItem] = swappedValue
        copyValues[selectedItem + 1] = selectedValue

        setValues(([...copyValues]))
        setSelectedItem(selectedItem + 1)
      }
      if (event.key == "Escape") {
        setSelectedItem(-1)
      }
      if (event.key == "Enter") {
        setSelectedItem(-1)
      }
    }

    const editShortcuts = (event: KeyboardEvent) => {
      console.log("firing edit")
      if (event.key == "Escape") {
        event.preventDefault()
        cancelAdding(editValues?.id || 0)
      }
    };

    // Add event listener
    if (moveItem) {
      window.addEventListener('keydown', selectingShortcuts);
    }
    if (selectedItem > -1) {
      window.addEventListener('keydown', movingShortcuts);
    }
    if (editValues) {
      window.addEventListener('keydown', editShortcuts);
    }

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', selectingShortcuts);
      window.removeEventListener('keydown', editShortcuts);
      window.removeEventListener('keydown', movingShortcuts);
    };
  }, [move, selectedItem, editValues, moveItem])

  const handleAddNewValue = () => {
    setValues((prev) => ([...prev, { id: 0, question: "", answer: "" }]))
    handleEdit(values.length)
  }

  const handleEdit = (key: number) => {
    if (editValues) { // saving
      // check the values
      if (editValues.question.length == 0) { setValueErrors((prev) => ({ ...prev, input: true })); }
      else { setValueErrors((prev) => ({ ...prev, input: false })); }
      if (editValues.answer.length == 0) { setValueErrors((prev) => ({ ...prev, textarea: true })); }
      else { setValueErrors((prev) => ({ ...prev, textarea: false })); }
      if (editValues.answer.length == 0 || editValues.question.length == 0) return // return if either values are missing

      setEditValues(null)
      let copyValues = values
      copyValues[key] = { ...editValues, id: key }
      setValues([...copyValues])
      return
    }

    // editing
    setEditValues({ question: values[key]?.question || "", answer: values[key]?.answer || "", id: key })
  }

  const cancelAdding = (key: number) => {
    const updatedvalues = values.filter((item, i) => i != key)
    setValues(updatedvalues)
    setEditValues(null)
    setValueErrors({ input: false, textarea: false })
  }

  const handleSaveFAQ = async () => {
    // add the checking of values
    const orderedItems = values.map((item, i) => ({ id: i, question: item.question, answer: item.answer }))

    const stringOrderedItems = JSON.stringify(orderedItems)
    const stringPrevContent = JSON.stringify(content)

    const hasChanged = md5Checker(stringOrderedItems, stringPrevContent)

    if (!hasChanged.status) { // prevent saving when no changes
      message.success("No changes made!")
      return
    }

    setLoading(true)
    const response = await loadConfig("faqcontent", JSON.stringify(orderedItems), true)
    setLoading(false)

    if (response.status == 500) {
      message.error("An error occured while saving FAQ, please try again later!")
      return
    }

    router.refresh()
  }

  return (
    <>
      <Accordion className="relative" type="single" collapsible>
        {
          values.map((item, i) => (
            <AccordionItem className={clsx("relative group", { "bg-muted": i == move || i == selectedItem })} value={`item-${i}`} key={i}>
              <div className={clsx("absolute flex gap-4 top-1/2 -left-[50px] -translate-y-2/4 opacity-0 group-hover:opacity-100 text-sm cursor-pointer", { "hidden": move > -1 || selectedItem > -1 })}>
                <p className={clsx("hover:underline", { "hidden": moveItem || selectedItem > -1 })} onClick={() => handleEdit(i)}>{
                  editValues?.id == i ? (
                    "Save"
                  ) : (
                    "Edit"
                  )
                }</p>
              </div>

              <AccordionTrigger>{i == editValues?.id ? (<>
                <Input className={clsx("", { "border-red-500": valueErrors.input })} value={editValues.question} onChange={(e) => {
                  setEditValues((prev) => ({ ...prev, question: e.target.value } as FAQEditType))
                }} placeholder="add a question..." />
              </>) : (
                <>
                  {item.question.length > 0 ? (
                    <>{item.question}</>
                  ) : (
                    <>Add a question?</>
                  )}
                </>
              )}</AccordionTrigger>
              <AccordionContent>
                {i == editValues?.id ? (<>
                  <Textarea className={clsx("", { "border-red-500": valueErrors.textarea })} value={editValues.answer} onChange={(e) => setEditValues((prev) => ({ ...prev, answer: e.target.value } as FAQEditType))} placeholder="write the answer..." />
                </>) : (
                  <>
                    {
                      item.answer.length > 0 ? (
                        <>{item.answer}</>
                      ) : (
                        <>Write your answer...</>
                      )
                    }
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))
        }

        <div className={clsx("group mt-5 border w-max py-2 px-4 rounded-[50px] cursor-pointer hover:border-none hover:w-full hover:px-0 hover:mt-0", {
          "pointer-events-none opacity-70": move > -1 || selectedItem > -1 || editValues != null
        })} onClick={() => handleAddNewValue()}>
          <p className="group-hover:hidden">Add new</p>
          <AccordionItem value="item-1" className="hidden opacity-50 group-hover:block">
            <AccordionTrigger>Add a new question?</AccordionTrigger>
            <AccordionContent>
              and write your answer...
            </AccordionContent>
          </AccordionItem>
        </div>

        <Button variant={"outline"} className="rounded-[50px] mr-1 mt-2"
          disabled={move > -1 || selectedItem > -1 || editValues != null}
          onClick={() => {
            setMove(0)
            setMoveItem(true)
          }}>
          Move item
        </Button>
        <Button className="rounded-[50px] ml-1 mt-2"
          disabled={move > -1 || selectedItem > -1 || editValues != null}
          onClick={() => handleSaveFAQ()}>
          Save FAQ
        </Button>

        <div className="flex justify-end items-end sticky bottom-5 gap-2 pointer-events-none opacity-70">
          {
            moveItem && (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Select</p>
                  <Button variant={"outline"}>Enter</Button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Cancel</p>
                  <Button variant={"outline"}>Esc</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Button variant={"outline"}><ArrowUp className="h-4 w-4" /></Button>
                    <p className="text-sm">Move up</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant={"outline"}><ArrowDown className="h-4 w-4" /></Button>
                    <p className="text-sm">Move down</p>
                  </div>
                </div>
              </>
            )
          }
          {
            selectedItem > -1 && (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm">Confirm</p>
                  <Button variant={"outline"}>Enter</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Button variant={"outline"}><ArrowUp className="h-4 w-4" /></Button>
                    <p className="text-sm">Move up</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant={"outline"}><ArrowDown className="h-4 w-4" /></Button>
                    <p className="text-sm">Move down</p>
                  </div>
                </div>
              </>
            )
          }
          {
            editValues != null && (
              <div className="flex items-center gap-2">
                <p className="text-sm">Cancel or Delete</p>
                <Button variant={"outline"}>Esc</Button>
              </div>
            )
          }
        </div>
      </Accordion>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Saving, please wait..." />
    </>
  )
}