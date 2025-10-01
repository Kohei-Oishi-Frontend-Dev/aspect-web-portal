import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sorting05Icon,
  FilterIcon,
  MoreVerticalIcon,
  UserGroupIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import Button from "../../components/Button";

// --- Type for the data structure our UI will use ---
interface User {
  id: string; // Will use email as a unique ID
  initials: string;
  name: string;
  email: string;
  access: string;
  status: "Active" | "Invited";
  location: string;
  invitedBy: string;
  lastActive: string;
}

// --- FIXED: Updated interface to match your actual API response ---
interface ApiUser {
  firstName: string;
  surname: string;
  email: string;
  Access: string | null;
  Status: "Active" | "Invited";
  location: string | null;
  invitedBy: string;
  lastActive: string | null;
}

// Sub-component for the status pills
const StatusPill: React.FC<{ status: User["status"] }> = ({ status }) => {
  const isInvited = status === "Invited";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isInvited
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {status}
    </span>
  );
};

const UsersLayout: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "removed">("active");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const toggleDropdown = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      const authToken = sessionStorage.getItem("authToken");
      const accountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");
      const userId = "005Ae000009IXjV";

      if (!authToken || !accountId) {
        setError(
          "Your session has expired or the account ID is missing. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/users-api/services/apexrest/portal/api/v1/users?currentAccountId=${accountId}&userId=${userId}`,
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
          throw new Error(apiResponse.message || "Failed to fetch users.");
        }

        const rawUsers: ApiUser[] = apiResponse.data || apiResponse;

        if (!Array.isArray(rawUsers)) {
          throw new Error("API response is not in the expected format.");
        }

        // --- FIXED: Updated mapping logic to handle your API data structure ---
        const formattedUsers = rawUsers.map((apiUser): User => {
          // Combine firstName and surname to create a full name
          const fullName = `${apiUser.firstName || ""} ${
            apiUser.surname || ""
          }`.trim();

          // Safely create initials from the new fullName
          const initials = fullName
            .split(" ")
            .map((n) => (n ? n[0] : ""))
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return {
            id: apiUser.email, // Using email as a unique key for the list
            initials: initials,
            name: fullName,
            email: apiUser.email,
            access: apiUser.Access || "User", // Handle null Access
            status: apiUser.Status, // Direct mapping for Status
            location: apiUser.location || "N/A", // Handle null location
            invitedBy: apiUser.invitedBy, // You might want to fetch the name for this ID later
            lastActive: apiUser.lastActive
              ? new Date(apiUser.lastActive).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "N/A", // Handle null lastActive
          };
        });

        setUsers(formattedUsers);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // --- RENDER LOGIC ---
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="text-center p-10 text-gray-500">
            Loading users...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} className="text-center p-10 text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (currentUsers.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="text-center p-10 text-gray-500">
            No users found.
          </td>
        </tr>
      );
    }

    return currentUsers.map((user) => (
      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
              {user.initials}
            </div>
            <div>
              <div className="font-bold">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.access}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <StatusPill status={user.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.location}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.invitedBy}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.lastActive}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(user.id);
            }}
            className="p-1.5 rounded-md hover:bg-gray-200"
          >
            <HugeiconsIcon
              icon={MoreVerticalIcon}
              className="w-5 h-5 text-gray-500"
            />
          </button>
          {openDropdown === user.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Send invite again
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Cancel invite
              </a>
            </div>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div
      className="min-h-full bg-white p-6"
      onClick={() => setOpenDropdown(null)}
    >
      {/* Header and Controls */}
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
            Add user
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Access
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Location label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Invited by
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last active
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
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, users.length)}
            </span>{" "}
            of <span className="font-medium">{users.length}</span> users
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

export default UsersLayout;
