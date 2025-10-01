import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import banner from "../../assets/7b36db813382101e06e5148a7336319b009ec7b5.jpg";
import NavHeader from "../navigation/NavHeader";

// ====== Interfaces ======
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

// ====== Colors ======
const BLUE = "#27549D";
const SUBTITLE = "#646F86";
const BORDER_SUBTLE = "#DEE8F7";

// ====== Column Name Mapping ======
const fieldNameMap: Record<string, string> = {
  Account__c: "Account",
  Account_Details__c: "Account Details",
  Account_Sector__c: "Account Sector",
  Account_Type__c: "Account Type",
  Job_Type__c: "Job Type",
  Name: "Name",
};

// Fallback prettifier
const prettifyFieldName = (key: string) => {
  if (fieldNameMap[key]) return fieldNameMap[key];
  return key
    .replace(/__/g, " ")
    .replace(/_/g, " ")
    .replace(
      /\w\S*/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
};

const InvoiceList: React.FC = () => {
  // tab switching
  const [activeTab, setActiveTab] = useState<"invoices" | "creditNotes">(
    "invoices"
  );

  // ===== Invoices State =====
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const itemsPerPage = 10;

  // ===== Credit Notes State =====
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [creditLoading, setCreditLoading] = useState(true);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [creditPage, setCreditPage] = useState(1);

  // ===== Fetch Invoices =====
  useEffect(() => {
    const fetchInvoices = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const currentAccountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !currentAccountId) {
        setInvoiceError(
          "You are not logged in or account ID is missing. Please log in to view invoices."
        );
        setInvoiceLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/invoice-api/services/apexrest/portal/api/v1/invoices?currentAccountId=${currentAccountId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }
        const data: ApiResponse<any> = await response.json();
        console.log("Fetched Invoices:", data);
        if (response.ok && data.success) setInvoices(data.data || []);
        else throw new Error(data.message || "Failed to fetch invoices.");
      } catch (err: any) {
        setInvoiceError(err.message);
      } finally {
        setInvoiceLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // ===== Fetch Credit Notes =====
  useEffect(() => {
    const fetchCreditNotes = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const currentAccountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !currentAccountId) {
        setCreditError(
          "You are not logged in or account ID is missing. Please log in to view credit notes."
        );
        setCreditLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/creditnotes-api/services/apexrest/portal/api/v1/creditnotes?currentAccountId=${currentAccountId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }
        const data: ApiResponse<any> = await response.json();
        console.log("Fetched Credit Notes:", data);
        if (response.ok && data.success) setCreditNotes(data.data || []);
        else throw new Error(data.message || "Failed to fetch credit notes.");
      } catch (err: any) {
        setCreditError(err.message);
      } finally {
        setCreditLoading(false);
      }
    };
    fetchCreditNotes();
  }, []);

  // ===== Pagination Helpers =====
  const paginate = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    page: number
  ) => setter(page);

  const LoadingRow = () => (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
      ))}
    </tr>
  );

  // ===== Render Table (Dynamic with Prettified Headers) =====
  const renderTable = (
    data: any[],
    loading: boolean,
    error: string | null,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    label: string
  ) => {
    const indexOfLast = page * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = data.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Get keys dynamically (skip Id for display)
    const keys =
      data.length > 0 ? Object.keys(data[0]).filter((k) => k !== "Id") : [];

    if (loading) {
      return (
        <div className="bg-white rounded-[12px] border shadow p-6">
          <table className="w-full">
            <thead>
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-4 py-3" />
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <LoadingRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-white rounded-[12px] border shadow p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-[12px] border shadow p-6">
        <h2 className="text-lg font-bold mb-6" style={{ color: BLUE }}>
          Your {label} ({data.length})
        </h2>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {label.toLowerCase()} found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr
                  style={{ borderColor: BORDER_SUBTLE }}
                  className="border-b-2"
                >
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-extrabold"
                      style={{ color: BLUE }}
                    >
                      {prettifyFieldName(key)}
                    </th>
                  ))}
                  <th
                    className="px-4 py-3 text-center text-xs font-extrabold"
                    style={{ color: BLUE }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr
                    key={item.Id}
                    className="border-b"
                    style={{ borderColor: BORDER_SUBTLE }}
                  >
                    {keys.map((key) => (
                      <td key={key} className="px-4 py-3">
                        {item[key] || "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <button className="text-blue-600">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm" style={{ color: SUBTITLE }}>
                  Showing {indexOfFirst + 1} to{" "}
                  {Math.min(indexOfLast, data.length)} of {data.length} results
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => paginate(setPage, page - 1)}
                    className="px-3 py-1 border rounded-md"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(setPage, i + 1)}
                      className={`px-3 py-1 border rounded-md ${
                        page === i + 1 ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => paginate(setPage, page + 1)}
                    className="px-3 py-1 border rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="relative w-full h-[130px] grid grid-cols-2 bg-cover bg-center"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute inset-0 bg-[#27549D]/50" />
        <div className="p-8 flex items-end z-10">
          <p className="text-white text-xl">Invoices & Credit Notes</p>
        </div>
        <div className="pt-4 relative z-10">
          <NavHeader />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("creditNotes")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "creditNotes"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Credit Notes
          </button>
        </div>

        {/* Content Switch */}
        {activeTab === "invoices"
          ? renderTable(
              invoices,
              invoiceLoading,
              invoiceError,
              invoicePage,
              setInvoicePage,
              "Invoice"
            )
          : renderTable(
              creditNotes,
              creditLoading,
              creditError,
              creditPage,
              setCreditPage,
              "Credit Note"
            )}
      </div>
    </div>
  );
};

export default InvoiceList;
