'use client'

import { useState } from 'react'
import { AlertCircle, Check, Save, Plus, Edit2, Trash2, Calendar, Clock, Film, Image as ImageIcon, ExternalLink, X } from 'lucide-react'
import { saveDailyTaskSettingsAction, createDailyTaskAction, updateDailyTaskAction, deleteDailyTaskAction } from '@/actions/dailyTask'
import { Button } from '@/components/ui/button'
import { ModalPortal } from '@/components/common/ModalPortal'
import { motion, AnimatePresence } from 'framer-motion'

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
  />
)

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className={`text-sm font-semibold text-white/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${props.className || ''}`}
  />
)

interface DailyTask {
  id: string
  mediaUrl: string
  mediaType: string
  duration: number
  message: string | null
  startDate: string
  startTime: string
  expiryDate: string
  expiryTime: string
  startAt: Date | string
  expireAt: Date | string
  createdAt: Date | string
}

interface DailyTaskSettingsFormProps {
  initialSettings: {
    dailyTaskEnabled: boolean
    dailyTaskMessage: string
  }
  initialTasks: DailyTask[]
}

export function DailyTaskSettingsForm({ initialSettings, initialTasks }: DailyTaskSettingsFormProps) {
  // Global Settings State
  const [globalEnabled, setGlobalEnabled] = useState(initialSettings.dailyTaskEnabled)
  const [globalMessage, setGlobalMessage] = useState(initialSettings.dailyTaskMessage)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalStatus, setGlobalStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Daily Tasks State
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null)
  
  // Task Form State
  const [mediaType, setMediaType] = useState('IMAGE')
  const [duration, setDuration] = useState(30)
  const [mediaUrl, setMediaUrl] = useState('')
  const [message, setMessage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('10:00')
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Form Submission State
  const [taskLoading, setTaskLoading] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  // Save Global Settings handler
  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalLoading(true)
    setGlobalStatus(null)

    try {
      const formData = new FormData()
      formData.append('dailyTaskEnabled', String(globalEnabled))
      formData.append('dailyTaskMessage', globalMessage)

      const result = await saveDailyTaskSettingsAction(formData)
      if (result.success) {
        setGlobalStatus({ type: 'success', text: result.message })
      } else {
        setGlobalStatus({ type: 'error', text: result.message })
      }
    } catch (error: any) {
      setGlobalStatus({ type: 'error', text: error.message || 'Failed to update global settings.' })
    } finally {
      setGlobalLoading(false)
    }
  }

  // Open modal for Creating Task
  const handleOpenCreateModal = () => {
    setEditingTask(null)
    setMediaType('IMAGE')
    setDuration(30)
    setMediaUrl('')
    setMessage('')
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setExpiryDate(tomorrow.toISOString().split('T')[0])
    
    setStartTime('10:00')
    setExpiryTime('10:00')
    setImageFile(null)
    setTaskError(null)
    setModalOpen(true)
  }

  // Open modal for Editing Task
  const handleOpenEditModal = (task: DailyTask) => {
    setEditingTask(task)
    setMediaType(task.mediaType)
    setDuration(task.duration)
    setMediaUrl(task.mediaUrl)
    setMessage(task.message || '')
    setStartDate(task.startDate)
    setStartTime(task.startTime)
    setExpiryDate(task.expiryDate)
    setExpiryTime(task.expiryTime)
    setImageFile(null)
    setTaskError(null)
    setModalOpen(true)
  }

  // Handle task Save (create or update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setTaskLoading(true)
    setTaskError(null)

    try {
      const formData = new FormData()
      formData.append('mediaType', mediaType)
      formData.append('duration', String(duration))
      formData.append('message', message)
      formData.append('startDate', startDate)
      formData.append('startTime', startTime)
      formData.append('expiryDate', expiryDate)
      formData.append('expiryTime', expiryTime)
      formData.append('mediaUrl', mediaUrl)

      if (mediaType === 'IMAGE' && imageFile) {
        formData.append('imageFile', imageFile)
      }

      let result
      if (editingTask) {
        result = await updateDailyTaskAction(editingTask.id, formData)
      } else {
        result = await createDailyTaskAction(formData)
      }

      if (result.success) {
        setModalOpen(false)
        window.location.reload() // Reload to fetch fresh list server-side
      } else {
        setTaskError(result.message)
      }
    } catch (error: any) {
      setTaskError(error.message || 'An unexpected error occurred.')
    } finally {
      setTaskLoading(false)
    }
  }

  // Handle task Delete
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this daily task?')) return

    try {
      const result = await deleteDailyTaskAction(id)
      if (result.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
      } else {
        alert(result.message)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.')
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Global Configuration */}
      <form onSubmit={handleSaveGlobalSettings} className="premium-card p-6 space-y-6 max-w-4xl">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          Global Daily Task Configuration
        </h2>

        {globalStatus && (
          <div
            className={`flex items-center gap-2.5 p-4 rounded-xl text-sm ${
              globalStatus.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {globalStatus.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{globalStatus.text}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
          <div>
            <Label className="text-base font-bold">Enable Daily Task Eligibility Requirement</Label>
            <p className="text-xs text-muted-foreground mt-1">
              When enabled, users must complete the daily task before claiming their daily yield reward.
            </p>
          </div>
          <input
            type="checkbox"
            checked={globalEnabled}
            onChange={(e) => setGlobalEnabled(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="globalMessage">Global Default Instructions Message</Label>
          <textarea
            id="globalMessage"
            rows={2}
            value={globalMessage}
            onChange={(e) => setGlobalMessage(e.target.value)}
            required
            className="flex w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="You must watch this image/video for the full duration set by the admin to qualify for today's daily yield reward."
          />
        </div>

        <div className="pt-2 border-t border-border/40 flex justify-end">
          <Button type="submit" disabled={globalLoading} className="gap-2 px-6">
            <Save className="w-4 h-4" />
            {globalLoading ? 'Saving Settings...' : 'Save Global Settings'}
          </Button>
        </div>
      </form>

      {/* 2. Tasks Table & Management */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-bold">Daily Tasks Schedule</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Create and manage tasks scheduled for specific time windows.
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} className="gap-2 px-4 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md">
            <Plus className="w-4 h-4" />
            Create Daily Task
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-background/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Image/Video</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Start Date & Time</th>
                <th className="px-6 py-4">Expiry Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                    No daily tasks configured yet. Click "Create Daily Task" to add one.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const now = new Date()
                  const isExpired = now > new Date(task.expireAt)
                  const isUpcoming = now < new Date(task.startAt)
                  
                  let statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-500">
                      Active
                    </span>
                  )
                  if (isExpired) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                        Expired
                      </span>
                    )
                  } else if (isUpcoming) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        Scheduled
                      </span>
                    )
                  }

                  const createdDateStr = new Date(task.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })

                  return (
                    <tr key={task.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                        {task.mediaType === 'IMAGE' ? (
                          <>
                            <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                            <a
                              href={task.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-xs truncate max-w-[150px]"
                            >
                              View Image <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        ) : (
                          <>
                            <Film className="w-4 h-4 text-purple-400 shrink-0" />
                            <a
                              href={task.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-xs truncate max-w-[180px]"
                              title={task.mediaUrl}
                            >
                              Watch Video <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/90 font-medium">
                        {task.duration}s
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/75" />
                          {task.startDate}
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/75 ml-1.5" />
                          {task.startTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/75" />
                          {task.expiryDate}
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/75 ml-1.5" />
                          {task.expiryTime}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {createdDateStr}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Create/Edit Modal */}
      <ModalPortal>
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-3xl text-white/90 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSaveTask} className="flex flex-col h-full w-full overflow-hidden">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">
                        {editingTask ? 'Edit Daily Task' : 'Create Daily Task'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {editingTask ? 'Update settings for this scheduled task' : 'Schedule a new viewing task for users'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-lg p-1.5 text-brand-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5 overflow-y-auto">
                    {taskError && (
                      <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{taskError}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Media Type */}
                      <div className="space-y-1.5">
                        <Label htmlFor="mediaType">Task Media Type</Label>
                        <select
                          id="mediaType"
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="IMAGE">Image View Task</option>
                          <option value="VIDEO">Video Watch Task</option>
                        </select>
                      </div>

                      {/* View Duration */}
                      <div className="space-y-1.5">
                        <Label htmlFor="duration">Required Duration (seconds)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                          required
                        />
                      </div>
                    </div>

                    {/* Media Type specifics */}
                    {mediaType === 'IMAGE' ? (
                      <div className="space-y-2">
                        <Label>Task Image source</Label>
                        
                        {/* Toggle between Upload and URL */}
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-muted/5 text-center min-h-[90px]">
                            <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground max-w-[160px] truncate font-semibold">
                              {imageFile ? imageFile.name : 'Upload New File'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 mt-0.5">Max: 1 MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setImageFile(e.target.files[0])
                                }
                              }}
                            />
                          </label>

                          <div className="flex flex-col justify-center space-y-1.5">
                            <Label htmlFor="mediaUrlInput">Or Image URL</Label>
                            <Input
                              id="mediaUrlInput"
                              type="text"
                              placeholder="e.g. /uploads/image.png"
                              value={mediaUrl}
                              onChange={(e) => setMediaUrl(e.target.value)}
                            />
                          </div>
                        </div>
                        {editingTask && editingTask.mediaType === 'IMAGE' && !imageFile && (
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            Current image: <span className="text-primary truncate max-w-[200px] inline-block align-bottom">{editingTask.mediaUrl}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label htmlFor="videoUrl">Video URL (YouTube or Direct Link)</Label>
                        <Input
                          id="videoUrl"
                          type="text"
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          required={mediaType === 'VIDEO'}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          YouTube links as well as raw file links (mp4, webm) are supported.
                        </p>
                      </div>
                    )}

                    {/* Schedule times */}
                    <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-white/5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        Schedule Configuration
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="expiryTime">Expiry Time</Label>
                          <Input
                            id="expiryTime"
                            type="time"
                            value={expiryTime}
                            onChange={(e) => setExpiryTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instruction Message Override */}
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message Override (Optional)</Label>
                      <textarea
                        id="message"
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Instructions specific to this task (defaults to global instructions if left blank)"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setModalOpen(false)}
                      className="border border-white/5 hover:bg-white/5 text-white/80"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={taskLoading} className="px-5">
                      {taskLoading ? 'Saving Task...' : editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  )
}
