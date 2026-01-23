import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  Loader,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

const RideRating = ({
  ride,
  userRole,
  otherUserName,
  otherUserRating,
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const feedbackOptions =
    userRole === "rider"
      ? [
          {
            key: "vehicleCondition",
            label: "Vehicle Condition",
            options: ["Dirty", "Clean", "Very Clean"],
          },
          {
            key: "driverBehavior",
            label: "Driver Behavior",
            options: ["Poor", "Good", "Excellent"],
          },
          {
            key: "safetyRating",
            label: "Safety",
            options: ["Unsafe", "Safe", "Very Safe"],
          },
        ]
      : [
          {
            key: "riderBehavior",
            label: "Rider Behavior",
            options: ["Rude", "Polite", "Very Polite"],
          },
          {
            key: "cleanliness",
            label: "Cleanliness",
            options: ["Messy", "Clean", "Very Clean"],
          },
        ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setError("");
      await onSubmit({
        rating,
        comment,
        feedback,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit rating");
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your rating and feedback have been submitted successfully.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Rate Your Ride</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">
                {otherUserName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{otherUserName}</p>
              <p className="text-xs text-gray-600">
                Current rating: {otherUserRating?.toFixed(1) || "N/A"} ⭐
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Rate the {userRole === "rider" ? "driver" : "rider"}
            </label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600">
                {rating === 5 && "😍 Excellent!"}
                {rating === 4 && "😊 Very Good!"}
                {rating === 3 && "😐 Good"}
                {rating === 2 && "😞 Poor"}
                {rating === 1 && "😠 Very Poor"}
              </p>
            )}
          </div>

          {/* Feedback Options */}
          {feedbackOptions.map((option) => (
            <div key={option.key} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {option.label}
              </label>
              <div className="flex gap-2">
                {option.options.map((opt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setFeedback({ ...feedback, [option.key]: index })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      feedback[option.key] === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Comment */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
              <MessageSquare className="w-4 h-4" />
              Additional Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              disabled={isLoading}
            />
          </div>

          {/* Ride Details */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
            <p className="text-gray-600">
              <span className="font-semibold">Distance:</span>{" "}
              {ride?.distance?.toFixed(1)} km
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Fare:</span> $
              {ride?.fare?.total?.toFixed(2)}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Duration:</span>{" "}
              {ride?.actualDuration} mins
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RideRating;
