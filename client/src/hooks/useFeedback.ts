import { useState, useCallback } from "react";

export interface FeedbackData {
  calculatorId: string;
  rating: number; // 1-5
  helpful: boolean | null; // Was this helpful?
  easeOfUse: number; // 1-5
  comment: string;
  timestamp: Date;
  userEmail?: string;
}

export function useFeedback() {
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>(() => {
    // Load from localStorage
    const stored = localStorage.getItem("medresearch_feedback");
    return stored ? JSON.parse(stored) : [];
  });

  const submitFeedback = useCallback((feedback: Omit<FeedbackData, "timestamp">) => {
    const newFeedback: FeedbackData = {
      ...feedback,
      timestamp: new Date(),
    };

    setFeedbackList((prev) => {
      const updated = [...prev, newFeedback];
      // Save to localStorage
      localStorage.setItem("medresearch_feedback", JSON.stringify(updated));
      return updated;
    });

    return newFeedback;
  }, []);

  const getFeedbackForCalculator = useCallback(
    (calculatorId: string) => {
      return feedbackList.filter((f) => f.calculatorId === calculatorId);
    },
    [feedbackList]
  );

  const getAverageRating = useCallback(
    (calculatorId: string) => {
      const feedback = getFeedbackForCalculator(calculatorId);
      if (feedback.length === 0) return 0;
      const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
      return (sum / feedback.length).toFixed(1);
    },
    [getFeedbackForCalculator]
  );

  const getHelpfulPercentage = useCallback(
    (calculatorId: string) => {
      const feedback = getFeedbackForCalculator(calculatorId);
      if (feedback.length === 0) return 0;
      const helpful = feedback.filter((f) => f.helpful === true).length;
      return Math.round((helpful / feedback.length) * 100);
    },
    [getFeedbackForCalculator]
  );

  const exportFeedbackData = useCallback(() => {
    return JSON.stringify(feedbackList, null, 2);
  }, [feedbackList]);

  return {
    feedbackList,
    submitFeedback,
    getFeedbackForCalculator,
    getAverageRating,
    getHelpfulPercentage,
    exportFeedbackData,
  };
}
