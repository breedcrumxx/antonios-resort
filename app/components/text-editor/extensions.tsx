import { Extension } from '@tiptap/core';

export const LiteralTab = Extension.create({
  name: 'literalTab',

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        return this.editor.commands.insertContent("\t")
      }
    }
  }

})

export const NextLine = Extension.create({
  name: 'NextLine',

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        return this.editor.chain().focus().setHardBreak().run()
      }
    }
  }

})