'use client';

import { useState } from 'react';
import { MOCK_FEEDBACKS } from './data';
import { FeedbackListSidebar } from './FeedbackListSidebar';
import { FeedbackDetailPane } from './FeedbackDetailPane';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function FeedbackPageClient() {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FEEDBACKS[0].id);

  const selectedFeedback = MOCK_FEEDBACKS.find(fb => fb.id === selectedId) || null;

  return (
    <div className="">
      <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Top Search bar - specific to Feedbacks */}
        <div className="flex items-center justify-end px-6 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm phản hồi..." 
              className="pl-9 h-10 border-slate-200 focus-visible:ring-slate-300 bg-slate-50 font-medium shadow-none" 
            />
          </div>
        </div>

        {/* Main Split Pane */}
        <div className="flex flex-1 overflow-hidden relative bg-white">
          {/* Left Side: List */}
          <div className={`absolute inset-0 lg:relative lg:flex lg:w-1/2 z-10 transition-transform bg-white ${selectedId ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
            <FeedbackListSidebar 
              feedbacks={MOCK_FEEDBACKS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Right Side: Detail */}
          <div className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col z-20 bg-slate-50 transition-transform ${selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <FeedbackDetailPane feedback={selectedFeedback} />
            
            {/* Mobile Back Button (Invisible on LG) */}
            {selectedId && (
              <button 
                className="lg:hidden absolute top-4 left-4 p-2 bg-white rounded-full shadow-md z-50 text-slate-700"
                onClick={() => setSelectedId(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
