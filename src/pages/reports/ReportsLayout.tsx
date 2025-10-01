import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sorting05Icon,
  FilterIcon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import Button from "../../components/Button";

// --- Report type based on API response ---
interface Report {
  reportUrl: string | null;
  Status: string;
  upload: string;
  location: string;
  appointment: string;
  jobId: string;
  name: string;
}

// --- ACTION DROPDOWN COMPONENT ---
interface ActionDropdownProps {
  reportId: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  reportId,
  isOpen,
  onToggle,
  onView,
  onDownload,
}) => {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(reportId);
        }}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        <HugeiconsIcon
          icon={MoreVerticalIcon}
          className="w-5 h-5 text-gray-500"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-20">
          <button
            onClick={() => onView(reportId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            View
          </button>
          <button
            onClick={() => onDownload(reportId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
};

const ReportsLayout: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // === NEW: Pagination State ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can change this value

  const toggleDropdown = (reportId: string) => {
    setOpenDropdown(openDropdown === reportId ? null : reportId);
  };

  const closeDropdown = () => setOpenDropdown(null);

  const handleView = (reportId: string) => {
    console.log(`Viewing report: ${reportId}`);
    closeDropdown();
  };

  const handleDownload = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    closeDropdown();
  };

  const getStatusBadge = (status: string) => {
    const lowerCaseStatus = status?.toLowerCase();
    let badgeClasses = "bg-gray-100 text-gray-800"; // Default

    if (lowerCaseStatus === "completed") {
      badgeClasses = "bg-green-100 text-green-800";
    } else if (lowerCaseStatus === "scheduled") {
      badgeClasses = "bg-blue-100 text-blue-800";
    }

    return (
      <span
        className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${badgeClasses}`}
      >
        {status}
      </span>
    );
  };

  useEffect(() => {
    const fetchReports = async () => {
      // ... existing fetch logic ...
      const authToken = sessionStorage.getItem("authToken");
      const currentAccountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !currentAccountId) {
        setError("You are not logged in or account ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/reports-api/services/apexrest/portal/api/v1/reports?currentAccountId=${currentAccountId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }

        const text = await response.text();
        console.log("Raw reports response:", text);

        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          throw new Error("Invalid JSON from API");
        }

        if (Array.isArray(parsed)) {
          setReports(parsed);
        } else if (parsed.data && Array.isArray(parsed.data)) {
          setReports(parsed.data);
        } else {
          throw new Error("Unexpected API response shape");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // === NEW: Pagination Calculations ===
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div
      className="p-4 md:p-6 bg-background min-h-full"
      onClick={closeDropdown}
    >
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-md">
              <HugeiconsIcon icon={Sorting05Icon} className="w-4 h-4 mr-2" />
              Sort
            </Button>
            <Button variant="outline" size="sm" className="rounded-md">
              <HugeiconsIcon icon={FilterIcon} className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <p className="text-gray-500">Loading reports...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* === MODIFIED: Map over currentReports === */}
                {currentReports.map((report, index) => (
                  <tr key={report.jobId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.jobId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.appointment
                        ? new Date(report.appointment).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.location || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.Status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.upload
                        ? new Date(report.upload).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionDropdown
                        reportId={report.jobId}
                        isOpen={openDropdown === report.jobId}
                        onToggle={toggleDropdown}
                        onView={handleView}
                        onDownload={handleDownload}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === NEW: Pagination Controls === */}
        {totalPages > 1 && !loading && !error && (
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, reports.length)}
              </span>{" "}
              of <span className="font-medium">{reports.length}</span> reports
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-10" onClick={closeDropdown} />
      )}
    </div>
  );
};

export default ReportsLayout;
