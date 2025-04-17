import React from 'react';

const ReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reportReason, 
  setReportReason, 
  reportDescription, 
  setReportDescription 
}) => {
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Report Image</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Reason</label>
            <select 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a reason</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Copyright violation">Copyright violation</option>
              <option value="Harassment">Harassment</option>
              <option value="Spam">Spam</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description (optional)</label>
            <textarea 
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded resize-none"
              rows="3"
              placeholder="Provide more details about the issue"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!reportReason}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;