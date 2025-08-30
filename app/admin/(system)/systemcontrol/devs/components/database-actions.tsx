'use client'

import { Button } from "@/app/components/ui/button"
import { UploadDatabaseBackup } from "@/app/components/ui/file-upload"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { useToast } from "@/app/components/ui/use-toast"
import FullCoverLoading from "@/lib/utils/full-cover-loading"
import { message } from "antd"
import { format } from "date-fns"
import { useState } from "react"

export default function DatabaseActions({ email, isAllowed }: { email: string, isAllowed: boolean }) {

  const { toast } = useToast()

  // states
  const [file, setFile] = useState<File | undefined>()
  const [loading, setLoading] = useState<string>('')

  const performDatabaseBackup = async () => {
    setLoading("Creating database backups...");

    try {
      // const response = await fetch('https://antonios-db-engine.onrender.com/dump', { method: "GET" });
      fetch('https://antonios-db-engine.onrender.com/dump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
      })

      toast({
        title: "Processing, an email will be sent when finished!",
        description: format(new Date(), "EEEE, MMMM d, yyyyy 'at' h:mm a")
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "An error occurred!",
        description: "Unable to backup the database!",
        variant: "destructive"
      });
    } finally {
      setLoading(""); // Reset loading state after the operation
    }
  };

  const performDatabaseRestoration = async () => {
    if (!file) {
      message.error("No file selected.")
      return
    }
    setLoading("Restoring database, this might take a while...")

    let formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`https://antonios-db-engine.onrender.com/restore`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      toast({
        title: "Database restored!",
        description: format(new Date(), "EEEE, MMMM d, yyyyy 'at' h:mm a")
      })
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "An error occured!",
        description: "Unable to restore database, please check the database status!",
        variant: "destructive"
      })
    } finally {
      setLoading("")
    }

  }

  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl text-gray-500">Backup and Restore Database</h1>
      <Separator />
      <div className="space-y-2">
        <Label>Perform database backup</Label><br />
        <Button className="bg-green-500" onClick={() => performDatabaseBackup()}>Backup database</Button>
        <p className="text-sm max-w-[50%]">Backup current database state, and get a copy through your email.</p>
      </div>
      <div className="space-y-2">
        <Label>Database backup file</Label>
        <UploadDatabaseBackup
          className="w-[150px] h-[150px]"
          value={file}
          onChange={(f) => {
            setFile(f);
          }}
        />
        <p className="text-sm">Upload the database backup zip file.</p>
        <br />

        <Label>Perform database restoration</Label><br />
        <Button onClick={() => performDatabaseRestoration()}
          disabled={!isAllowed || !file}
        >Restore database</Button>
        <p className="text-sm max-w-[50%]">Perform a database restoration from the uploaded backup file. <span className="underline font-bold">Only available on system maintenance state.</span></p>
      </div>

      <FullCoverLoading open={loading.length > 0} defaultOpen={false} loadingLabel={loading} />
    </div>
  )
}