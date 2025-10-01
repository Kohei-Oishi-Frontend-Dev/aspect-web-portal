import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sorting05Icon,
  FilterIcon,
  MoreVerticalIcon,
  Building01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import Button from "../../components/Button";

// A type for our location data (for the UI) - NO CHANGES NEEDED HERE
interface Location {
  id: string;
  label: string;
  address: string;
  townCity: string;
  county: string | null;
  postcode: string;
}

// FIXED: Updated interface to match the actual field names from your API response
interface ApiLocation {
  Id: string;
  Name: string;
  Site_Street__c: string | null;
  Site_City__c: string | null;
  Site_State__c: string | null; // This will be our 'county'
  Site_PostalCode__c: string | null;
}

const LocationsLayout: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "removed">("active");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust as needed

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);

      const authToken = sessionStorage.getItem("authToken");
      const currentAccountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !currentAccountId) {
        setError(
          "Your session is invalid or an Account ID is missing. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/sites-api/services/apexrest/portal/api/v1/sites?currentAccountId=${currentAccountId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }

        const apiResponse = await response.json();

        if (!response.ok || apiResponse.success === false) {
          throw new Error(apiResponse.message || "Failed to fetch locations.");
        }

        // This correctly handles the { "data": [...] } structure
        const rawLocations: ApiLocation[] = apiResponse.data || apiResponse;

        if (!Array.isArray(rawLocations)) {
          throw new Error(
            "API response did not return a valid list of locations."
          );
        }

        // FIXED: Updated mapping logic to use the correct field names
        const formattedLocations = rawLocations.map(
          (apiLoc): Location => ({
            id: apiLoc.Id,
            label: apiLoc.Name,
            address: apiLoc.Site_Street__c || "-",
            townCity: apiLoc.Site_City__c || "-",
            county: apiLoc.Site_State__c || null,
            postcode: apiLoc.Site_PostalCode__c || "-",
          })
        );

        setLocations(formattedLocations);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  // --- RENDER LOGIC ---
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-10 text-gray-500">
            Loading locations...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-10 text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (currentLocations.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-10 text-gray-500">
            No locations found.
          </td>
        </tr>
      );
    }

    return currentLocations.map((location) => (
      <tr
        key={location.id}
        className="border-b border-gray-100 hover:bg-gray-50"
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary flex items-center gap-2">
          <HugeiconsIcon icon={Building01Icon} />
          {location.label}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {location.address}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {location.townCity}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {location.county || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {location.postcode}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="p-1.5 rounded-md hover:bg-gray-200">
            <HugeiconsIcon
              icon={MoreVerticalIcon}
              className="w-5 h-5 text-gray-500"
            />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-full bg-white p-4 md:p-6">
      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md ${
              activeTab === "active"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("removed")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md ${
              activeTab === "removed"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Removed
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Sorting05Icon} className="w-4 h-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterIcon} className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="primary" size="sm">
            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
            Add location
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Location label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Town/City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                County
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Postcode
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">{renderTableContent()}</tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && !loading && !error && (
        <div className="flex justify-between items-center pt-4 mt-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-word-wrap: break-word; font-medium">
              {indexOfFirstItem + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, locations.length)}
            </span>{" "}
            of <span className="font-medium">{locations.length}</span> locations
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
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
  );
};

export default LocationsLayout;
