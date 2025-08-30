'use client'

import { Button } from '@/app/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/ui/select"
import { Separator } from '@/app/components/ui/separator'
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Strikethrough, Underline as UnderlineIcon } from 'lucide-react'
import React, { createContext, useContext, useState } from 'react'
import './editor.css'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu"
import { useDevs } from '@/app/providers/dev-configuration-provider'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import TextAlign from '@tiptap/extension-text-align'
import { LiteralTab, NextLine } from './extensions'

export function TextEditorModal({ open, close, value, save }: { open: boolean, close: () => void, value: string, save: (value: string) => void }) {

  // context
  const { content } = useTextEditor()

  // states
  const [warningModal, setWarningModal] = useState<boolean>(false)

  const checkContent = () => {
    if (content != value) {
      setWarningModal(true)
      return
    }
    close()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(e) => checkContent()}>
        <DialogContent className="min-w-[80vw] h-[80vh]" customclose="hidden">
          <TextEditorBubbleMenu />
          <TextEditorControls>
            <Button variant={"ghost"} className='rounded-none' onClick={() => save(content)}>
              Save
            </Button>
          </TextEditorControls>
          <TextEditor />
        </DialogContent>
      </Dialog>
      <Dialog open={warningModal}>
        <DialogContent disableclose>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to close this without saving? All changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant={"ghost"} onClick={() => {
              setWarningModal(false)
              close()
            }}>Close without saving</Button>
            <Button className="bg-prm" onClick={() => {
              setWarningModal(false)
              save(content)
            }}>Save and close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function TextEditor() {

  const { editor } = useTextEditor()

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}

export function TextEditorControls({ children }: { children: React.ReactNode }) {

  const { editor } = useTextEditor()
  const [value, setValue] = useState<string>("p")

  if (!editor) {
    return (
      <div className="w-full h-[50px] flex items-center px-4 border">Unable to build controls</div>
    )
  }

  return (
    <div className="w-full h-[50px] flex gap-2 items-center px-4 border">
      <Select value={value} onValueChange={(e) => {
        setValue(e)
        if (e != "p") {
          editor.chain().focus().toggleHeading({ level: parseInt(e[1]) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
        } else {
          editor.chain().focus().setParagraph().run()
        }
      }}>
        <SelectTrigger className="w-[180px] ring-offset-0 focus:outline-none focus:ring-0 focus:ring-none border-none outline-none">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Separator orientation='vertical' />

      {/* Decorations */}
      <div>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('bold') })}
        >
          <Bold className='w-4 h-4' />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('italic') })}
        >
          <Italic className='w-4 h-4' />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('strike') })}
        >
          <Strikethrough className='w-4 h-4' />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('underline') })}
        >
          <UnderlineIcon className='w-4 h-4' />
        </Button>
      </div>

      <Separator orientation='vertical' />

      {/* Aligns */}
      <div>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'left' }) })}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'center' }) })}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'right' }) })}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'justify' }) })}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation='vertical' />

      {/* Formatter */}
      <div>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('bulletList') })}
        >
          <List className='w-4 h-4' />
        </Button>
        <Button variant={"ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('orderedList') })}
        >
          <ListOrdered className='w-4 h-4' />
        </Button>
      </div>

      <Separator orientation='vertical' />

      {/* Inserts */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"ghost"} className="rounded-none">
            Insert
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal line</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setBlockquote().run()}>Block qoute</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-grow"></div>
      {children}
    </div>
  )
}

export function TextEditorBubbleMenu() {

  const { editor } = useTextEditor()

  if (!editor) return null

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className="w-max flex gap-2 rounded shadow bg-white">
        {/* Decorations */}
        <div className="flex">
          <Button
            variant={"ghost"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('bold') })}
          >
            <Bold className='w-4 h-4' />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('italic') })}
          >
            <Italic className='w-4 h-4' />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('strike') })}
          >
            <Strikethrough className='w-4 h-4' />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleUnderline()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('underline') })}
          >
            <UnderlineIcon className='w-4 h-4' />
          </Button>
        </div>

        <Separator orientation='vertical' />

        <div className="flex">
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'left' }) })}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'center' }) })}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'right' }) })}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive({ textAlign: 'justify' }) })}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation='vertical' />

        <div className="flex">
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('bulletList') })}
          >
            <List className='w-4 h-4' />
          </Button>
          <Button variant={"ghost"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
            className={clsx("rounded-none", { "bg-accent text-accent-foreground": editor.isActive('orderedList') })}
          >
            <ListOrdered className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </BubbleMenu>
  )
}

export const TextEditorContext = createContext<{ editor: Editor | null, content: string, setContent: (value: string) => void }>({
  editor: null,
  content: "",
  setContent: () => { },
})

export function TextEditorProvider({ children, value, placeholder }: { children: React.ReactNode, value: string, placeholder: string }) {

  const { dev } = useDevs()
  const [content, setContent] = useState<string>(value)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Underline,
      HorizontalRule,
      HardBreak,
      NextLine,
      LiteralTab,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'heading'
        }
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'bg-muted px-4 py-4'
        }
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'pl-4 list-disc'
        },
        keepAttributes: true,
        keepMarks: true,
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: ''
        }
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'pl-4 list-decimal',
        },
        keepAttributes: true,
        keepMarks: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: "h-[400px] p-4 w-full border overflow-y-scroll scroll"
      }
    },
    immediatelyRender: false,
    content: content,
    onUpdate({ editor }) {
      setContent(editor.getHTML())
      if (dev.DEBUG) { // debug control line
        console.log(editor.getHTML())
      }
    },
    injectCSS: true,
  })

  return (
    <TextEditorContext.Provider value={{
      editor,
      content,
      setContent
    }}>
      {children}
    </TextEditorContext.Provider>
  )
}

export const useTextEditor = () => {
  return useContext(TextEditorContext)
}