import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorName: string;
  onSubmit: (data: {
    rating: number;
    helpful: boolean | null;
    easeOfUse: number;
    comment: string;
  }) => void;
}

export function FeedbackModal({
  open,
  onOpenChange,
  calculatorName,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      rating,
      helpful,
      easeOfUse,
      comment,
    });
    setSubmitted(true);
    setTimeout(() => {
      setRating(0);
      setHelpful(null);
      setEaseOfUse(0);
      setComment("");
      setSubmitted(false);
      onOpenChange(false);
    }, 1500);
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
            <p className="text-xs text-slate-600 mt-1">We'll use this to improve Medad</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Was this helpful? */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Was this calculator helpful?
              </label>
              <div className="flex gap-2">
                <Button
                  variant={helpful === true ? "default" : "outline"}
                  onClick={() => setHelpful(true)}
                  className="flex-1 gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  variant={helpful === false ? "destructive" : "outline"}
                  onClick={() => setHelpful(false)}
                  className="flex-1 gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Rate this calculator (1-5 stars)
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

            {/* Ease of Use */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Ease of use (1-5)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEaseOfUse(level)}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                      level <= easeOfUse
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Additional comments (optional)
              </label>
              <Textarea
                placeholder="Tell us what you think..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || helpful === null}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
