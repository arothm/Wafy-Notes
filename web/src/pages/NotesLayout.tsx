import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, FolderOpen, Pin, Search, Trash2 } from 'lucide-react'
import { notesApi } from '@wafy/core'
import { Button, Card, Input } from '@wafy/ui'
import { formatRelativeTime } from '@wafy/utils'
import NoteEditor from '../components/NoteEditor'

interface Note {
  _id: string; title: string; content: string; folder?: string; tags: string[]; pinned: boolean; updatedAt: string
}

export default function NotesLayout() {
  const { t } = useTranslation('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadNotes = useCallback(async () => {
    const params: Record<string, string> = {}
    if (activeFolder) params.folder = activeFolder
    if (search) params.search = search
    const res = await notesApi.list(params)
    if (res.success) setNotes(res.data)
  }, [activeFolder, search])

  const loadFolders = async () => {
    const res = await notesApi.getFolders()
    if (res.success) setFolders(res.data)
  }

  useEffect(() => { loadNotes(); loadFolders() }, [loadNotes])

  const createNote = async () => {
    const res = await notesApi.create({ title: '', content: '', folder: activeFolder })
    if (res.success) { setNotes([res.data, ...notes]); setSelectedNote(res.data) }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const res = await notesApi.update(id, updates)
    if (res.success) {
      setNotes(notes.map((n) => (n._id === id ? res.data : n)))
      if (selectedNote?._id === id) setSelectedNote(res.data)
    }
  }

  const deleteNote = async (id: string) => {
    await notesApi.delete(id)
    setNotes(notes.filter((n) => n._id !== id))
    if (selectedNote?._id === id) setSelectedNote(null)
  }

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950">
      {/* Sidebar */}
      <div className="w-56 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2">
        <Button onClick={createNote} className="w-full"><Plus size={16} className="mr-2" />{t('newNote', 'New Note')}</Button>
        <div className="mt-4 text-sm font-medium text-neutral-500">{t('folders', 'Folders')}</div>
        <button onClick={() => setActiveFolder(null)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${!activeFolder ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
          <FolderOpen size={14} /> {t('allNotes', 'All Notes')}
        </button>
        {folders.map((f) => (
          <button key={f} onClick={() => setActiveFolder(f)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm truncate ${activeFolder === f ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            <FolderOpen size={14} /> {f}
          </button>
        ))}
      </div>

      {/* Note list */}
      <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <Input placeholder={t('search', 'Search...')} value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={14} />} />
        </div>
        <div className="flex-1 overflow-auto">
          {notes.map((note) => (
            <button key={note._id} onClick={() => setSelectedNote(note)}
              className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${selectedNote?._id === note._id ? 'bg-gold-50 dark:bg-gold-900/20' : ''}`}>
              <div className="flex items-center gap-1">
                {note.pinned && <Pin size={12} className="text-gold-500" />}
                <span className="font-medium text-sm truncate">{note.title || t('untitled', 'Untitled')}</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">{formatRelativeTime(note.updatedAt)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
              <input className="flex-1 text-lg font-semibold bg-transparent outline-none" value={selectedNote.title}
                onChange={(e) => { setSelectedNote({ ...selectedNote, title: e.target.value }); updateNote(selectedNote._id, { title: e.target.value }) }}
                placeholder={t('untitled', 'Untitled')} />
              <Button variant="ghost" size="sm" onClick={() => updateNote(selectedNote._id, { pinned: !selectedNote.pinned })}>
                <Pin size={16} className={selectedNote.pinned ? 'text-gold-500' : ''} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteNote(selectedNote._id)}><Trash2 size={16} /></Button>
            </div>
            <NoteEditor content={selectedNote.content} onChange={(html) => updateNote(selectedNote._id, { content: html })} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400">{t('selectNote', 'Select a note or create a new one')}</div>
        )}
      </div>
    </div>
  )
}
