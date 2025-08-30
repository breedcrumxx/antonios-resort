'use client'

import { TextEditorModal, TextEditorProvider } from "@/app/components/text-editor/editor"
import { saveWebsiteConfiguration } from "@/lib/actions/system-actions/save-website-config"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Container({ children, value, target }: { children: React.ReactNode, value: string, target: string }) {

  const router = useRouter()

  // states 
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSaveNotes = async (editedvalue: string) => {
    let modified = editedvalue

    if (modified == value) { // prevent saving when no changes made
      message.success("No changes made!")
      return
    }

    setLoading(true)
    if (target == "privacypolicy" || target == "cookiepolicy" || target == "termscondition" || target == "agreement") {
      modified = JSON.stringify({
        lastupdated: new Date(),
        content: editedvalue
      })
    }

    const response = await saveWebsiteConfiguration(target, modified)
    setLoading(false)

    if (response.status == 500) {
      message.error("Unable to save the configuration!")
      return
    }

    message.success("Configuration updated!")
    router.refresh()
    setOpenEditor(false)
  }

  return (
    <>
      <div onClick={() => setOpenEditor(true)}>
        {children}
      </div>
      <TextEditorProvider value={value} placeholder="">
        <TextEditorModal open={openEditor} close={() => setOpenEditor(false)} value={value} save={handleSaveNotes} />
      </TextEditorProvider>
      <FullCoverLoading open={loading} defaultOpen={false} loadingLabel="Saving, please wait..." />
    </>
  )
}