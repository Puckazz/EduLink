'use client';

import { useState } from 'react';
import { ParentFeedbackSubmitForm } from '@/components/parent/feedback/ParentFeedbackSubmitForm';
import { ParentFeedbackContactCard } from '@/components/parent/feedback/ParentFeedbackContactCard';
import { ParentFeedbackHistoryCard } from '@/components/parent/feedback/ParentFeedbackHistoryCard';
import { ParentFeedbackThread } from '@/components/parent/feedback/ParentFeedbackThread';
import { useMyFeedbacks } from '@/hooks/queries/useMyFeedbacks';
import type { Feedback } from '@/types/feedback';

export default function ParentFeedbackPage() {
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const { data: feedbacks } = useMyFeedbacks();

  const selectedFeedback: Feedback | undefined = feedbacks?.find(
    (fb) => fb.feedback_id === selectedFeedbackId,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Gửi Phản Hồi Cho Trường</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kênh liên lạc trực tiếp với ban giám hiệu nhà trường
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left column: form/thread + history */}
        <div className="flex flex-col gap-5">
          {selectedFeedback ? (
            <ParentFeedbackThread
              feedback={selectedFeedback}
              onBack={() => setSelectedFeedbackId(null)}
            />
          ) : (
            <ParentFeedbackSubmitForm
              onSuccess={() => {
              }}
            />
          )}

          <ParentFeedbackHistoryCard
            onViewThread={(id) => setSelectedFeedbackId(id)}
          />
        </div>

        {/* Right column: contact info */}
        <ParentFeedbackContactCard />
      </div>
    </div>
  );
}
