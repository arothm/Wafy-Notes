import mongoose, { Schema, Document } from 'mongoose'

export interface INote extends Document {
  userId: string
  title: string
  content: string
  folder?: string
  tags: string[]
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    folder: { type: String, default: null },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
)

noteSchema.index({ userId: 1, pinned: -1, updatedAt: -1 })

export const Note = mongoose.model<INote>('Note', noteSchema)
