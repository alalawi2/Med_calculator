import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorName: string;
}

export function FeedbackModal({
  open,
  onOpenChange,
  calculatorName,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => {
        setRating(0);
        setFeedbackText("");
        setUserEmail("");
        setSubmitted(false);
        onOpenChange(false);
      }, 2000);
    },
    onError: (error) => {
      toast.error("Failed to submit feedback. Please try again.");
      console.error("Feedback submission error:", error);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    submitFeedback.mutate({
      calculatorName,
      rating,
      feedbackText: feedbackText || undefined,
      userEmail: userEmail || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help us improve {calculatorName}</DialogTitle>
          <DialogDescription>Your feedback helps us build better clinical tools</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-sm font-medium text-green-600">Thank you for your feedback!</p>
            <p className="text-xs text-slate-600 mt-1">We'll use this to improve our calculators</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Rate this calculator (1-5 stars) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Additional comments (optional)
              </label>
              <Textarea
                placeholder="Tell us what you think..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Your email (optional)
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                We'll only use this to follow up on your feedback if needed
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitFeedback.isPending}
              className="w-full"
            >
              {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
