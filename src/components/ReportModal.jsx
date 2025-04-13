import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

function ReportModal({ image, onClose }) {
  const [reportReason, setReportReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Inappropriate content',
    'Violent or graphic content',
    'Hateful or abusive content',
    'Harassment or bullying',
    'Harmful or dangerous acts',
    'Child abuse',
    'Copyright violation',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // In a real app, you would send the report to your API
    setTimeout(() => {
      setSubmitting(false);
      alert('Your report has been submitted. Thank you for helping keep our community safe.');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="text-center mb-6 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-600 mr-2" />
          <h2 className="text-2xl font-bold">Report this image</h2>
        </div>

        <p className="mb-4 text-gray-600">
          Help us understand what's wrong with this image. Your report will be reviewed by our moderators.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this image?
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-center">
                  <input
                    type="radio"
                    id={reason}
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={reason}>{reason}</label>
                </div>
              ))}
            </div>
          </div>

          {reportReason === 'Other' && (
            <div className="mb-4">
              <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700 mb-2">
                Please specify:
              </label>
              <textarea
                id="otherReason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="3"
                required
              ></textarea>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reportReason || (reportReason === 'Other' && !otherReason) || submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;