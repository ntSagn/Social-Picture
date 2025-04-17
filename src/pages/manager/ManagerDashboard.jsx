import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { usersService } from '../../api/usersService';
import { reportsService } from '../../api/reportsService';
import { imagesService } from '../../api/imagesService';

function ManagerDashboard() {
  const navigate = useNavigate();
  const [reportedImages, setReportedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterReportType, setFilterReportType] = useState('');
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Define report types for filtering
  const reportTypes = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'violence', label: 'Violence' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
  ];

  // Redirect if not manager or admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await usersService.getCurrentUser();
        console.log("Current user:", user.data); // Debug user object
        setCurrentUser(user.data);

        // Redirect if not manager or admin (role 1 or 2)
        if (!user || (user.data.role !== 1 && user.data.role !== 2)) {
          console.log("Not a manager, redirecting. Role:", user?.data.role);
          navigate('/');
          return;
        }

        setAuthChecked(true);
      } catch (err) {
        console.error("Error fetching current user:", err);
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Fetch data from APIs
  useEffect(() => {
    if (!authChecked || !currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all images
        const imagesData = await imagesService.getAll();
        console.log("Images data:", imagesData);

        // Fetch reports
        const reportsData = await reportsService.getAll();
        console.log("Reports data:", reportsData);

        // Map reports to images
        const imagesWithReports = imagesData.data.map(image => {
          const imageReports = reportsData.data.filter(report => report.imageId === image.imageId);
          return { ...image, reports: imageReports };
        });

        // Only get reported images
        const reported = imagesWithReports.filter(img => img.reports && img.reports.length > 0);

        setReportedImages(reported);

        // Fetch users for filtering
        // const usersData = await usersService.getAll();
        // setUsers(usersData.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked, currentUser]);

  // Filter images based on search, user filter, and report type filter
  const filteredImages = reportedImages.filter(image => {
    const matchesSearch = searchQuery === '' ||
      image.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesUser = filterUser === '' ||
      (image.user && image.user.username?.toLowerCase() === filterUser.toLowerCase());

    const matchesReportType = filterReportType === '' ||
      (image.reports && image.reports.some(report => report.type === filterReportType));

    return matchesSearch && matchesUser && matchesReportType;
  });

  const handleViewImage = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const handleDeleteClick = (image) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const handleResolveReport = async (image, reportId) => {
    try {
      // Prompt the user for a resolution comment
      const resolutionComment = prompt("Please enter a resolution comment:", "Content reviewed and complies with community guidelines.");
      
      // If user cancels the prompt, abort the resolution
      if (resolutionComment === null) return;
      
      // Prepare the resolution payload
      const resolutionData = {
        status: 1,  // 1 means "resolved"
        resolutionComment: resolutionComment
      };
      
      // Call the API to resolve the report
      await reportsService.resolveReport(reportId, resolutionData);
      
      // Update local state
      const updatedReportedImages = reportedImages.map(img => {
        if (img.imageId === image.imageId) {
          // Remove the resolved report from the image
          return {
            ...img,
            reports: img.reports.filter(report => report.id !== reportId)
          };
        }
        return img;
      });
      
      // Remove images with no reports from reportedImages
      const filteredReportedImages = updatedReportedImages.filter(
        img => img.reports && img.reports.length > 0
      );
      
      // Update the reportedImages state
      setReportedImages(filteredReportedImages);
      
      // Show success notification
      alert("Report has been successfully resolved");
    } catch (err) {
      console.error("Error resolving report:", err);
      alert(err.message || "Failed to resolve the report");
    }
  };

  const handleResolveAllReports = async (image) => {
    try {
      // Check if the image has any reports
      if (!image.reports || image.reports.length === 0) {
        alert("No reports found for this image");
        return;
      }

      // Call the API to resolve all reports for this image
      await Promise.all(image.reports.map(report =>
        reportsService.resolveReport(report.id || report.reportId)
      ));

      // Update the reported images list by removing the image
      setReportedImages(reportedImages.filter(img =>
        (img.id || img.imageId) !== (image.id || image.imageId)
      ));

      // Show success notification
      alert("All reports for this image have been resolved");
    } catch (err) {
      console.error("Error resolving reports:", err);
      alert(err.message || "Failed to resolve reports");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedImage && deleteReason) {
      try {
        // Call the API to delete the image
        await imagesService.delete(selectedImage.id || selectedImage.imageId, deleteReason);

        // Update local state
        setReportedImages(reportedImages.filter(img =>
          (img.id || img.imageId) !== (selectedImage.id || selectedImage.imageId)
        ));

        // Show success notification
        alert(`Image deleted successfully. User ${selectedImage.user.username} has been notified.`);

        // Close modal and reset state
        setShowDeleteModal(false);
        setSelectedImage(null);
        setDeleteReason('');
      } catch (err) {
        console.error("Error deleting image:", err);
        alert(err.message || "Failed to delete image");
      }
    }
  };

  const handleDismissReport = async (image, reportId) => {
    try {
      // Call API to dismiss report
      await reportsService.dismissReport(reportId);

      // Update local state - remove this report from the image
      const updatedReportedImages = reportedImages.map(img => {
        if ((img.id || img.imageId) === (image.id || image.imageId)) {
          return {
            ...img,
            reports: img.reports.filter(report => report.id !== reportId)
          };
        }
        return img;
      });

      // Remove images that no longer have reports
      const filtered = updatedReportedImages.filter(img => img.reports && img.reports.length > 0);

      setReportedImages(filtered);

      // Show success notification
      alert("Report dismissed successfully");
    } catch (err) {
      console.error("Error dismissing report:", err);
      alert(err.message || "Failed to dismiss report");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Show loading state while checking authentication
  if (!authChecked || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-blue-500 animate-spin"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

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
                Logged in as Manager
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
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filterReportType}
                    onChange={(e) => setFilterReportType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Report Types</option>
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-blue-500 animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h2 className="text-lg font-semibold mb-2">Reported Images</h2>
                  <p className="text-gray-600">
                    {reportedImages.length} image{reportedImages.length !== 1 ? 's' : ''} with reports requiring review
                  </p>
                </div>

                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredImages.length > 0 ? (
                      filteredImages.map((image) => (
                        <tr key={image.id || image.imageId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-16 w-16 rounded overflow-hidden">
                              <img
                                src={image.url || image.imageUrl}
                                alt={image.caption}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{image.caption}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {image.tags && image.tags.map(tag => (
                                <span key={tag} className="inline-block bg-gray-100 px-2 py-0.5 rounded-full mr-1">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Posted: {formatDate(image.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img
                                  src={image.userProfilePicture}
                                  alt={image.user?.username}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://i.pravatar.cc/150?img=1'; // Fallback image
                                  }}
                                />
                              </div>
                              <div className="ml-2 text-sm text-gray-900">{image.user?.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {image.reports && image.reports.map(report => (
                                <div key={report.reportId} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="flex items-center">
                                    <AlertTriangle size={14} className="text-red-500 mr-1" />
                                    <span className="font-medium">{reportTypes.find(t => t.value === report.type)?.label || report.type}</span>
                                    <span className="ml-auto text-xs text-gray-500">{formatDate(report.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{report.reason}</p>
                                  <div className="mt-1 text-xs text-gray-600">
                                    Reported by: {report.reporterUsername || 'Anonymous'}
                                  </div>
                                  <div className="mt-1 flex justify-end">
                                    <button
                                      onClick={() => handleResolveReport(image, report.reportId)}
                                      className="text-green-600 hover:text-green-800 text-xs flex items-center"
                                    >
                                      <CheckCircle size={14} className="mr-1" />
                                      Resolve
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleViewImage(image.id || image.imageId)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex items-center"
                                title="View image"
                              >
                                <Eye size={16} className="mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteClick(image)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 flex items-center"
                                title="Delete image"
                              >
                                <Trash2 size={16} className="mr-1" />
                                Delete
                              </button>
                              <button
                                onClick={() => handleResolveAllReports(image)}
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 flex items-center"
                                title="Resolve all reports"
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Resolve All
                              </button>
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
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-center mb-4">Confirm Image Deletion</h2>

            <div className="mb-4 flex items-center justify-center">
              <img
                src={selectedImage.url || selectedImage.imageUrl}
                alt={selectedImage.caption}
                className="h-32 rounded shadow-sm"
              />
            </div>

            <div className="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-gray-700 mb-2">
                <b>Reports:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedImage.reports && selectedImage.reports.map(report => (
                  <li key={report.id} className="text-sm">
                    <span className="font-medium">{reportTypes.find(t => t.value === report.type)?.label || report.type}:</span> {report.reason}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mb-4 text-gray-700">
              You are about to delete an image uploaded by <b>{selectedImage.user?.username}</b>.
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