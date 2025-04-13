import React from 'react';
import { X } from 'lucide-react';

function ReportDetailModal({ report, onClose, onResolve }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">Report Details</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Reported by</p>
            <p className="font-medium">{report.reporter.username}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Reason</p>
            <p className="bg-gray-50 p-3 rounded">{report.reason}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Report Date</p>
            <p>{formatDate(report.created_at)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              report.status === 'resolved' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>
          
          {report.status === 'pending' && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={onResolve}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mark as Resolved
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;