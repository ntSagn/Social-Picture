import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getCurrentUser } from '../../services/auth';
import ReportDetailModal from '../../components/ReportDetailModal';

function ManagerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [reportedImages, setReportedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Redirect if not manager or admin
  useEffect(() => {
    if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Mock data for reported images
    const mockReportedImages = [
      { 
        id: 4, 
        url: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg', 
        caption: 'Forest Path',
        user: { id: 5, username: 'nature_walks', profilePicture: 'https://i.pravatar.cc/150?img=6' },
        created_at: '2023-10-18T09:30:00Z',
        reports: [
          { 
            id: 1, 
            reason: 'Copyright violation', 
            reporter: { id: 1, username: 'user1' }, 
            status: 'pending', 
            created_at: '2023-10-19T11:20:00Z'
          }
        ],
        tags: ['nature', 'forest']
      },
      { 
        id: 5, 
        url: 'https://i.pinimg.com/736x/de/3a/94/de3a9491bbdd5aeecd615ff43693236a.jpg', 
        caption: 'Beach Sunset',
        user: { id: 6, username: 'beach_lover', profilePicture: 'https://i.pravatar.cc/150?img=7' },
        created_at: '2023-10-19T15:10:00Z',
        reports: [
          { 
            id: 2, 
            reason: 'Inappropriate content', 
            reporter: { id: 3, username: 'photo_lover' }, 
            status: 'pending', 
            created_at: '2023-10-20T08:45:00Z'
          },
          { 
            id: 3, 
            reason: 'Violent content', 
            reporter: { id: 4, username: 'city_explorer' }, 
            status: 'resolved', 
            created_at: '2023-10-20T09:30:00Z',
            resolved_at: '2023-10-21T14:15:00Z',
            resolved_by: { id: 2, username: 'admin' }
          }
        ],
        tags: ['beach', 'sunset']
      }
    ];
    
    setReportedImages(mockReportedImages);
  }, []);

  const filteredImages = reportedImages.filter(image => {
    // Search by caption or tag
    const matchesSearch = searchQuery === '' || 
      image.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by report status
    const hasMatchingReports = image.reports.some(report => {
      return filterStatus === 'all' || report.status === filterStatus;
    });
    
    return matchesSearch && hasMatchingReports;
  });

  const handleViewImage = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const handleViewReport = (report, image) => {
    setSelectedReport(report);
    setSelectedImage(image);
    setShowDetailModal(true);
  };

  const handleResolveReport = () => {
    // In a real app, you would make an API call to resolve the report
    const updatedReportedImages = reportedImages.map(image => {
      if (image.id === selectedImage.id) {
        const updatedReports = image.reports.map(report => {
          if (report.id === selectedReport.id) {
            return {
              ...report,
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              resolved_by: user
            };
          }
          return report;
        });
        
        return {
          ...image,
          reports: updatedReports
        };
      }
      return image;
    });
    
    setReportedImages(updatedReportedImages);
    setShowDetailModal(false);
    setSelectedReport(null);
    setSelectedImage(null);
  };

  const handleDeleteClick = (image) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedImage && deleteReason) {
      // In a real app, you would make an API call to delete the image
      setReportedImages(reportedImages.filter(img => img.id !== selectedImage.id));
      setShowDeleteModal(false);
      setSelectedImage(null);
      setDeleteReason('');
      
      // In a real app, you would also send a notification to the user
      alert(`Image deleted. Notification sent to ${selectedImage.user.username} with reason: ${deleteReason}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <div className="ml-16 w-full">
        <Header />
        <main className="pt-20 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
              <div className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                Logged in as {user.role}
              </div>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by caption or tag..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredImages.length > 0 ? (
                    filteredImages.map((image) => (
                      <tr key={image.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-16 w-16 rounded overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={image.caption} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{image.caption}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {image.tags.map(tag => (
                              <span key={tag} className="inline-block bg-gray-100 px-2 py-0.5 rounded-full mr-1">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                              <img 
                                src={image.user.profilePicture} 
                                alt={image.user.username}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-2 text-sm text-gray-900">{image.user.username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {image.reports.map(report => (
                              <button
                                key={report.id}
                                onClick={() => handleViewReport(report, image)}
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium w-full ${
                                  report.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {report.status === 'pending' ? (
                                  <AlertTriangle size={12} className="mr-1" />
                                ) : (
                                  <CheckCircle size={12} className="mr-1" />
                                )}
                                {report.reason.slice(0, 20)}{report.reason.length > 20 ? '...' : ''}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewImage(image.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View image"
                            >
                              <Eye size={18} />
                            </button>
                            {image.reports.some(report => report.status === 'pending') && (
                              <button
                                onClick={() => handleDeleteClick(image)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete reported image"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No reported images found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
            setSelectedImage(null);
          }}
          onResolve={handleResolveReport}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-center mb-4">Confirm Image Deletion</h2>
            
            <div className="mb-4 flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption} 
                className="h-32 rounded shadow-sm"
              />
            </div>
            
            <p className="mb-4 text-gray-700">
              You are about to delete a reported image uploaded by <b>{selectedImage.user.username}</b>. 
              This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for deletion (will be sent to user):
              </label>
              <textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Please provide a reason for deleting this image..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedImage(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!deleteReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;