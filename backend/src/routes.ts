import { Router, Request, Response } from 'express'
import { Note } from './models/Note'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const { folder, page = '1', limit = '50', search } = req.query
    const filter: Record<string, any> = { userId: req.user!.userId }
    if (folder) filter.folder = folder
    if (search) filter.title = { $regex: search, $options: 'i' }

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(100, parseInt(limit as string))
    const skip = (pageNum - 1) * limitNum

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ pinned: -1, updatedAt: -1 }).skip(skip).limit(limitNum),
      Note.countDocuments(filter),
    ])
    res.json({ success: true, data: notes, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.get('/folders', async (req: Request, res: Response) => {
  try {
    const folders = await Note.distinct('folder', { userId: req.user!.userId, folder: { $ne: null } })
    res.json({ success: true, data: folders })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user!.userId })
    if (!note) { res.status(404).json({ success: false, error: 'Note not found' }); return }
    res.json({ success: true, data: note })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, folder, tags } = req.body
    const note = await Note.create({ userId: req.user!.userId, title: title || '', content: content || '', folder: folder || null, tags: tags || [] })
    res.status(201).json({ success: true, data: note })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, folder, tags, pinned } = req.body
    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (folder !== undefined) updates.folder = folder || null
    if (tags !== undefined) updates.tags = tags
    if (pinned !== undefined) updates.pinned = pinned

    const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, updates, { new: true })
    if (!note) { res.status(404).json({ success: false, error: 'Note not found' }); return }
    res.json({ success: true, data: note })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId })
    if (!note) { res.status(404).json({ success: false, error: 'Note not found' }); return }
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

export { router as notesRouter }
