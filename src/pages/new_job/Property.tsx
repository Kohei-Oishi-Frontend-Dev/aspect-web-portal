import React, { useState, useEffect } from "react";
// 1. Firebase imports have been removed.
import Select from "../../components/Select";
import { useNewJob } from "./NewJobContext";

// Interface for the raw site data from your Salesforce API
interface ApiSite {
  Id: string;
  Site_Street__c: string;
  Site_PostalCode__c: string;
}

const Property: React.FC = () => {
  const { jobState, updateJobState } = useNewJob();

  // 2. State for properties, loading, and error remains the same.
  const [propertyOptions, setPropertyOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useEffect has been updated to fetch from your live API.
  useEffect(() => {
    const fetchProperties = async () => {
      // Get authentication details from the browser's session storage
      const authToken = sessionStorage.getItem("authToken");
      const accountId =
        sessionStorage.getItem("currentAccountId") ||
        sessionStorage.getItem("accountId");

      if (!authToken || !accountId) {
        setError("Your session is invalid. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          // Use the proxy path for your sites API
          `/sites-api/services/apexrest/portal/api/v1/sites?currentAccountId=${accountId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }

        const apiResponse = await response.json();

        if (!response.ok || !apiResponse.success) {
          throw new Error(apiResponse.message || "Failed to fetch sites.");
        }

        const rawSites: ApiSite[] = apiResponse.data || [];

        // 4. Map the fetched API data into the { value, label } format
        const properties = rawSites.map((site) => ({
          value: site.Id, // Use the unique record ID as the value
          // Combine street and postal code for a user-friendly label
          label: `${site.Site_Street__c}, ${site.Site_PostalCode__c}`,
        }));

        setPropertyOptions(properties);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching sites:", err);
        setError("Failed to load properties. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []); // The empty array [] ensures this runs only once

  const handlePropertyChange = (value: string) => {
    updateJobState({ selectedProperty: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">Where is your property</h2>
      <div className="bg-background p-4 rounded-md">
        {/* 5. The Select component works without changes as it's already dynamic */}
        <Select
          value={jobState.selectedProperty}
          onChange={handlePropertyChange}
          options={propertyOptions}
          label=""
          className="bg-white"
          placeholder={
            isLoading
              ? "Loading properties..."
              : "Select from saved list of properties"
          }
          required
          disabled={isLoading || !!error}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Property;
