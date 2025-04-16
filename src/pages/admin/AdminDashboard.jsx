import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, Trash2, Eye, CheckCircle } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { usersService } from '../../api/usersService';
import { reportsService } from '../../api/reportsService';
import { imagesService } from '../../api/imagesService';
import { getImageUrl } from '../../utils/imageUtils';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [images, setImages] = useState([]);
  const [reportedImages, setReportedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Redirect if not admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await usersService.getCurrentUser();
        console.log("Current user:", user.data); // Debug user object
        setCurrentUser(user.data);

        // Redirect if not admin
        if (!user || user.data.role !== 2) {
          console.log("Not an admin, redirecting. Role:", user?.data.role);
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

        // Identify reported images
        const reported = imagesWithReports.filter(img => img.reports && img.reports.length > 0);

        setImages(imagesWithReports);
        setReportedImages(reported);

        // Fetch users for filtering
        const usersData = await usersService.getAll();
        setUsers(usersData.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked, currentUser]);

  // Reset pagination when changing tabs, search query, or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterUser, filterStatus]);

  // Filter images based on search, user filter, and status filter
  const filteredImages = activeTab === 'reported'
    ? reportedImages.filter(filterImage)
    : images.filter(filterImage);

  const paginatedImages = activeTab === 'all'
    ? filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredImages;

  const totalPages = activeTab === 'all'
    ? Math.ceil(filteredImages.length / itemsPerPage)
    : 1;

  function filterImage(image) {
    const matchesSearch = searchQuery === '' ||
      image.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesUser = filterUser === '' ||
      (image.user && image.user.username?.toLowerCase() === filterUser.toLowerCase());

    const matchesStatus = filterStatus === '' ||
      (filterStatus === 'reported' && image.reports && image.reports.length > 0) ||
      (filterStatus === 'unreported' && (!image.reports || image.reports.length === 0));

    return matchesSearch && matchesUser && matchesStatus;
  }

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

      // Update main images state if we're in the admin dashboard
      if (images) {
        const updatedImages = images.map(img => {
          if (img.imageId === image.imageId) {
            // Remove the resolved report from the image
            return {
              ...img,
              reports: img.reports.filter(report => report.id !== reportId)
            };
          }
          return img;
        });
        setImages(updatedImages);
      }

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

      // Prompt the user for a resolution comment
      const resolutionComment = prompt(
        "Please enter a resolution comment for all reports:",
        "All reports reviewed and content complies with community guidelines."
      );

      // If user cancels the prompt, abort the resolution
      if (resolutionComment === null) return;

      // Prepare the resolution payload
      const resolutionData = {
        status: 1,  // 1 means "resolved"
        resolutionComment: resolutionComment
      };

      // Call the API to resolve all reports for this image
      await Promise.all(
        image.reports.map(report =>
          reportsService.resolveReport(report.id || report.reportId, resolutionData)
        )
      );

      // Update main images state if we're in the admin dashboard
      if (images) {
        const updatedImages = images.map(img => {
          if (img.imageId === image.imageId) {
            return { ...img, reports: [] };
          }
          return img;
        });
        setImages(updatedImages);
      }

      // Update the reportedImages list
      setReportedImages(reportedImages.filter(img => img.imageId !== image.imageId));

      // Show success notification
      alert("All reports for this image have been resolved");
    } catch (err) {
      console.error("Error resolving reports:", err);
      alert(err.message || "Failed to resolve reports");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedImage && deleteReason.trim()) { // Still check for reason for UI purposes
      try {
        console.log("Attempting to delete image:", parseInt(selectedImage.imageId));
        
        // Call the API to delete the image - only passing the imageId
        await imagesService.delete(parseInt(selectedImage.imageId));
    
        // Update local state
        setImages(images.filter(img => img.imageId !== selectedImage.imageId));
        setReportedImages(reportedImages.filter(img => img.imageId !== selectedImage.imageId));
    
        // Show success notification
        alert(`Image deleted successfully. User ${selectedImage.user?.username} has been notified.`);
    
        // Close modal and reset state
        setShowDeleteModal(false);
        setSelectedImage(null);
        setDeleteReason('');
      } catch (err) {
        console.error("Error deleting image:", err);
        alert(`Failed to delete image: ${err.message || "Unknown error"}`);
      }
    } else if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion");
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                Logged in as Admin
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
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user.userId} value={user.username}>{user.username}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="reported">Reported</option>
                    <option value="unreported">Not Reported</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                All Images ({filteredImages.length})
              </button>
              <button
                onClick={() => setActiveTab('reported')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'reported'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Reported Images ({reportedImages.length})
              </button>
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
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedImages.length > 0 ? (
                      paginatedImages.map((image) => (
                        <tr key={image.imageId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-16 w-16 rounded overflow-hidden">
                              <img
                                src={image.imageUrl}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(image.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {image.reports && image.reports.length > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle size={12} className="mr-1" />
                                Reported ({image.reports.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                No Reports
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewImage(image.id || image.imageId)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="View image"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(image)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete image"
                              >
                                <Trash2 size={18} />
                              </button>
                              {image.reports && image.reports.length > 0 && (
                                <button
                                  onClick={() => handleResolveAllReports(image)}
                                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                  title="Resolve all reports for this image"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No images found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Add this after the table, just before the closing div.overflow-x-auto */}
                {activeTab === 'all' && totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filteredImages.length)}
                          </span>{" "}
                          of <span className="font-medium">{filteredImages.length}</span> results
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page when changing items per page
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                        </select>

                        <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* Page numbers */}
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Show limited page numbers with ellipsis for better UX
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === pageNum
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
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
                src={selectedImage.imageUrl}
                alt={selectedImage.caption}
                className="h-32 rounded shadow-sm"
              />
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

export default AdminDashboard;