'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  Info, 
  Coins, 
  Users, 
  Award, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs, FAQ_CATEGORIES } from '@/lib/faq-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FAQClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Clear query helper
  const handleClearSearch = () => setSearchQuery('')

  // Filter FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faq.listItems && faq.listItems.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())))
      
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Get icons for each category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'general': return <Info className="w-4 h-4" />
      case 'earnings': return <Coins className="w-4 h-4" />
      case 'membership': return <Users className="w-4 h-4" />
      case 'rewards': return <Award className="w-4 h-4" />
      case 'vision': return <Sparkles className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Galaxy Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Stats Control panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-12"
        >
          {/* Glassmorphic Search Input */}
          <div className="relative max-w-2xl mx-auto mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur-md opacity-50 group-focus-within:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1 transition-all duration-300 group-focus-within:border-primary/50">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search questions, keywords, policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3.5 bg-transparent border-0 text-white placeholder-white/40 focus:outline-none focus:ring-0 text-base"
              />
              {searchQuery && (
                <button 
                  onClick={handleClearSearch}
                  className="p-2 hover:bg-white/10 rounded-xl mr-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${
                selectedCategory === 'all'
                  ? 'text-white border-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'text-white/60 border-white/5 hover:border-white/15 hover:text-white bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>All Questions</span>
              {selectedCategory === 'all' && (
                <motion.span 
                  layoutId="activeCategoryBorder" 
                  className="absolute inset-0 rounded-full border border-primary pointer-events-none" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {Object.entries(FAQ_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 border ${
                  selectedCategory === key
                    ? 'text-white border-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'text-white/60 border-white/5 hover:border-white/15 hover:text-white bg-white/5'
                }`}
              >
                {getCategoryIcon(key)}
                <span>{label}</span>
                {selectedCategory === key && (
                  <motion.span 
                    layoutId="activeCategoryBorder" 
                    className="absolute inset-0 rounded-full border border-primary pointer-events-none" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ List Content */}
        <div className="relative z-10 min-h-[300px]">
          <AnimatePresence mode="wait">
            {filteredFaqs.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Accordion 
                  type="single" 
                  collapsible 
                  className="space-y-4"
                  key={`${selectedCategory}-${searchQuery}-accordion`} // resetting layout state on filter
                >
                  {filteredFaqs.map((faq, index) => {
                    const isChecklist = faq.question.includes('Why choose');
                    return (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border-none rounded-2xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 group data-[state=open]:border-primary/30 data-[state=open]:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                      >
                        <AccordionTrigger className="px-6 py-5 hover:no-underline text-left font-bold text-white/90 hover:text-white transition-colors text-base sm:text-lg [&[data-state=open]]:text-primary flex items-center justify-between gap-4">
                          <span className="flex items-start gap-4">
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/5 text-muted-foreground shrink-0 border border-white/5 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/10 transition-colors">
                              Q{(faqs.findIndex(f => f.id === faq.id) + 1)}
                            </span>
                            <span className="leading-snug">{faq.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-1 border-t border-white/5 text-muted-foreground leading-relaxed text-sm sm:text-base bg-black/10">
                          {faq.answer && (
                            <p className="mb-4 text-white/80 whitespace-pre-line">{faq.answer}</p>
                          )}
                          
                          {faq.listItems && (
                            <ul className={`space-y-2.5 ${isChecklist ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 space-y-0 mt-3' : 'list-none pl-1'}`}>
                              {faq.listItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  {isChecklist ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2.5" />
                                  )}
                                  <span className="text-white/80">{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 px-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
              >
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No matching questions found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                  We couldn't find any questions matching "{searchQuery}". Try refining your search keywords or switching categories.
                </p>
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  className="rounded-xl"
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-950/15 to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white mb-2">Still have questions?</h3>
              <p className="text-muted-foreground max-w-lg text-sm sm:text-base">
                Can't find the answer you are looking for? Learn more about VR Galaxy Networks or get in touch with our friendly community support team.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 shrink-0">
              <Link href="/about">
                <Button variant="ghost" className="rounded-xl border border-white/10 hover:bg-white/5 text-white">
                  About Platform
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-500 text-white font-bold group shadow-lg shadow-primary/25 px-5">
                  Get In Touch <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
