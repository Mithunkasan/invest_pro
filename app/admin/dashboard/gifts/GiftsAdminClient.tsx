'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, Truck, Package, CheckCircle, Clock, X,
  Calendar, Phone, Mail, User, MapPin, ChevronRight, Check
} from 'lucide-react'
import { updateGiftTrackingAction } from '@/actions/adminGift'
import { formatDate } from '@/utils/formatters'
import { ModalPortal } from '@/components/common/ModalPortal'

interface GiftAdminItem {
  id: string
  userId: string
  fullName: string
  age: number
  mobile: string
  email: string
  houseNo: string
  area: string
  city: string
  district: string
  state: string
  pinCode: string
  trackingNumber: string
  courierName: string
  dispatchDate: string | null
  expectedDeliveryDate: string | null
  deliveryStatus: 'PENDING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  createdAt: string
  user: {
    name: string
    email: string
    phone: string | null
  }
}

interface GiftsAdminClientProps {
  gifts: GiftAdminItem[]
}

export function GiftsAdminClient({ gifts: initialGifts }: GiftsAdminClientProps) {
  const [gifts, setGifts] = useState<GiftAdminItem[]>(initialGifts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedGift, setSelectedGift] = useState<GiftAdminItem | null>(null)

  useEffect(() => {
    if (selectedGift) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [selectedGift])

  useEffect(() => {
    if (!selectedGift) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGift(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGift])
  
  // Update Form State
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    courierName: '',
    dispatchDate: '',
    expectedDeliveryDate: '',
    deliveryStatus: 'PENDING' as any
  })

  // --- STATS COUNTERS ---
  const totalCount = gifts.length
  const pendingCount = gifts.filter(g => g.deliveryStatus === 'PENDING').length
  const shippedCount = gifts.filter(g => g.deliveryStatus === 'SHIPPED' || g.deliveryStatus === 'OUT_FOR_DELIVERY').length
  const deliveredCount = gifts.filter(g => g.deliveryStatus === 'DELIVERED').length

  // --- FILTER & SEARCH ---
  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch = 
      gift.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gift.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gift.mobile.includes(searchQuery) ||
      gift.city.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesStatus = 
      statusFilter === 'ALL' || 
      gift.deliveryStatus === statusFilter ||
      (statusFilter === 'SHIPPED' && (gift.deliveryStatus === 'SHIPPED' || gift.deliveryStatus === 'OUT_FOR_DELIVERY'))

    return matchesSearch && matchesStatus
  })

  // --- DRAWER ACTIONS ---
  const handleSelectGift = (gift: GiftAdminItem) => {
    setSelectedGift(gift)
    setSuccessMsg('')
    setErrorMsg('')
    setTrackingForm({
      trackingNumber: gift.trackingNumber || '',
      courierName: gift.courierName || '',
      dispatchDate: gift.dispatchDate ? gift.dispatchDate.split('T')[0] : '',
      expectedDeliveryDate: gift.expectedDeliveryDate ? gift.expectedDeliveryDate.split('T')[0] : '',
      deliveryStatus: gift.deliveryStatus
    })
  }

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGift) return
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    const res = await updateGiftTrackingAction(selectedGift.id, trackingForm)
    if (res.success) {
      setSuccessMsg(res.message)
      // Update local gifts state list
      setGifts(prev => prev.map(g => {
        if (g.id === selectedGift.id) {
          return {
            ...g,
            ...trackingForm,
            dispatchDate: trackingForm.dispatchDate ? new Date(trackingForm.dispatchDate).toISOString() : null,
            expectedDeliveryDate: trackingForm.expectedDeliveryDate ? new Date(trackingForm.expectedDeliveryDate).toISOString() : null,
            updatedAt: new Date().toISOString()
          }
        }
        return g
      }))
      
      // Update current selected item tracking info
      setSelectedGift(prev => {
        if (!prev) return null
        return {
          ...prev,
          ...trackingForm,
          dispatchDate: trackingForm.dispatchDate ? new Date(trackingForm.dispatchDate).toISOString() : null,
          expectedDeliveryDate: trackingForm.expectedDeliveryDate ? new Date(trackingForm.expectedDeliveryDate).toISOString() : null,
        }
      })
    } else {
      setErrorMsg(res.message)
    }
    setLoading(false)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'SHIPPED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'OUT_FOR_DELIVERY':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      case 'DELIVERED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      default:
        return 'text-muted-foreground bg-white/5 border-white/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Stats cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', count: totalCount, icon: Package, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Pending Dispatches', count: pendingCount, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'In Transit', count: shippedCount, icon: Truck, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Delivered Kits', count: deliveredCount, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="premium-card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-white mt-0.5">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10 gap-1 self-start md:self-center">
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'SHIPPED', label: 'Transit' },
            { key: 'DELIVERED', label: 'Delivered' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Requests Table ── */}
      <div className="premium-card overflow-hidden">
        {filteredGifts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
            No gift requests match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground text-[10px] uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4">Premium Member</th>
                  <th className="px-6 py-4">State & City</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Courier Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGifts.map((gift) => (
                  <tr 
                    key={gift.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleSelectGift(gift)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-white">{gift.fullName}</p>
                      <p className="text-[10px] text-muted-foreground tracking-tight select-all">{gift.email}</p>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      <p>{gift.state}</p>
                      <p className="text-[10px] text-muted-foreground">{gift.city} ({gift.pinCode})</p>
                    </td>
                    <td className="px-6 py-4 text-white font-mono select-all">{gift.mobile}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(gift.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] uppercase font-black ${getStatusBadgeClass(gift.deliveryStatus)}`}>
                        {gift.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectGift(gift)}
                        className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage Shipment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-out Details Drawer ── */}
      <AnimatePresence>
        {selectedGift && (
          <ModalPortal>
            <>
              {/* Drawer Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] bg-black/75"
                onClick={() => setSelectedGift(null)}
              />
              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 bottom-0 right-0 z-[9999] w-full max-w-md bg-slate-950 border-l border-white/5 text-white/90 shadow-2xl flex flex-col h-full"
              >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Gift Shipment Console</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">UID: {selectedGift.userId.slice(0, 12)}...</p>
                </div>
                <button
                  onClick={() => setSelectedGift(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* User Address summary */}
                <div className="space-y-4 rounded-2xl bg-white/5 border border-white/5 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 pb-2 border-b border-white/5">
                    <MapPin className="w-4 h-4" /> Shipping Address Summary
                  </h4>
                  
                  <div className="space-y-3.5 text-xs font-semibold text-white/70">
                    <div className="flex gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Member Addressee</span>
                        <span className="text-white font-bold">{selectedGift.fullName} ({selectedGift.age} Years)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Mobile Phone</span>
                        <span className="text-white select-all font-mono">{selectedGift.mobile}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Email</span>
                        <span className="text-white select-all">{selectedGift.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Courier Destination</span>
                        <span className="text-white leading-relaxed block font-bold">
                          {selectedGift.houseNo}, {selectedGift.area}<br />
                          {selectedGift.city}, {selectedGift.district}<br />
                          {selectedGift.state} - <span className="font-mono text-indigo-300 font-black">{selectedGift.pinCode}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courier Dispatch Entry Form */}
                <form onSubmit={handleUpdateTracking} className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Truck className="w-4 h-4" /> Dispatch Tracking Console
                  </h4>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {successMsg}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Transit Status</label>
                      <select
                        value={trackingForm.deliveryStatus}
                        onChange={(e) => setTrackingForm(prev => ({ ...prev, deliveryStatus: e.target.value as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="PENDING">PENDING DISPATCH</option>
                        <option value="SHIPPED">SHIPPED / IN TRANSIT</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED SUCCESSFULLY</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Courier Partner Name</label>
                      <input
                        type="text"
                        placeholder="e.g. DTDC Express, Blue Dart, Delhivery"
                        value={trackingForm.courierName}
                        onChange={(e) => setTrackingForm(prev => ({ ...prev, courierName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Courier Tracking ID</label>
                      <input
                        type="text"
                        placeholder="e.g. DX98273615IN"
                        value={trackingForm.trackingNumber}
                        onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Dispatch Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={trackingForm.dispatchDate}
                            onChange={(e) => setTrackingForm(prev => ({ ...prev, dispatchDate: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Expected Delivery</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={trackingForm.expectedDeliveryDate}
                            onChange={(e) => setTrackingForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Update Courier Dispatch Details'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              </div>
            </motion.aside>
            </>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  )
}
