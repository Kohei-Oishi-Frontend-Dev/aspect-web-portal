import React, { useState, useEffect } from "react";
import BusinessInfo from "./BusinessInfo";
import PaymentCards from "./PaymentCards";
import UserAccount from "./UserAccount";
// import { BusinessInfoData } from "./BusinessInfoModal"; /Users/visheshsahijwani/Desktop/aspect-web-portal/src/pages/billing/BusinessInfoModal.tsx

// --- Interfaces to match your actual API response ---
interface ApiCard {
  id: string;
  name: string;
  cardType: string;
  accountReferenceNumber: string; // This is the last 4 digits
  expiryDate: string; // e.g., "2033-01-31"
}

interface ApiData {
  DRC: boolean;
  PORequirement: boolean;
  CISNumber: string;
  VATNumber: string;
  companyType: string;
  paymentTerms: string | null;
  creditLimit: number | null;
  accountType: string;
  authorisations: ApiCard[];
}

const BillingLayout: React.FC = () => {
  // 1. State for holding API data, loading status, and errors
  const [billingData, setBillingData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      setError(null);

      const authToken = sessionStorage.getItem("authToken");
      const accountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !accountId) {
        setError(
          "Your session has expired or is invalid. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          // Using the proxy path for your billing API
          `/billing-api/services/apexrest/portal/api/v1/account-data?currentAccountId=${accountId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }

        const apiResponse = await response.json();
        console.log("Billing API Response:", apiResponse); // Helpful for debugging

        if (!response.ok || !apiResponse.success) {
          throw new Error(
            apiResponse.message || "Failed to fetch billing data."
          );
        }

        setBillingData(apiResponse.data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []); // Empty array means this runs once on component mount

  // Handler for saving Business Info (for optimistic UI updates without a page refresh)
  const handleBusinessInfoSave = (updatedInfo: BusinessInfoData) => {
    if (billingData) {
      setBillingData({
        ...billingData,
        companyType: updatedInfo.companyType,
        PORequirement: updatedInfo.poRequirement === "Required",
        VATNumber: updatedInfo.vatRegistrationNumber,
        DRC: updatedInfo.drcApplies === "Yes",
        CISNumber: updatedInfo.cisNumber,
      });
    }
  };

  // 3. Render loading or error states
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading billing information...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (!billingData) {
    return (
      <div className="p-6 text-center text-gray-500">
        No billing data was found.
      </div>
    );
  }

  // 4. If data is loaded successfully, render the child components with props
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BusinessInfo data={billingData} onSave={handleBusinessInfoSave} />
            <UserAccount data={billingData} />
          </div>
          <div>
            <PaymentCards cards={billingData.authorisations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingLayout;
