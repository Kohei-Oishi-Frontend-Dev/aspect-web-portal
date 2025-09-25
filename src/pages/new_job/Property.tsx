import React, { useState, useEffect } from "react";
// 1. Import Firestore functions and the database instance
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import Select from "../../components/Select";
import { useNewJob } from "./NewJobContext";
import Button from "../../components/Button";
import NewLocationModal from "./NewLocationModal";

const Property: React.FC = () => {
  const { jobState, updateJobState } = useNewJob();

  // 2. Set up state to hold the properties, loading status, and any errors
  const [propertyOptions, setPropertyOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Use useEffect to fetch data from Firestore when the component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const sitesCollectionRef = collection(db, "sites");
        const querySnapshot = await getDocs(sitesCollectionRef);

        // 4. Map the fetched documents into the { value, label } format
        const properties = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            value: doc.id, // Use the unique document ID as the value
            // Combine street and postal code for a user-friendly label
            label: `${data.Site_Street__c}, ${data.Site_PostalCode__c}`,
          };
        });

        setPropertyOptions(properties);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching sites:", err);
        setError("Failed to load properties. Please try again.");
      } finally {
        setIsLoading(false); // Stop the loading indicator
      }
    };

    fetchProperties();
  }, []); // The empty array [] ensures this runs only once

  const handlePropertyChange = (value: string) => {
    updateJobState({ selectedProperty: value });
  };

  const handleAddLocationClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveNewLocation = (data: {
    addressLine1: string;
    addressLine2?: string;
    townCity?: string;
    county?: string;
    postCode?: string;
  }) => {
    // Create a temporary id for the newly added location
    const id = `new-${Date.now()}`;
    const label = `${data.addressLine1}${
      data.postCode ? `, ${data.postCode}` : ""
    }`;
    const newOption = { value: id, label };
    // Prepend to options and select the new one
    setPropertyOptions((prev) => [newOption, ...prev]);
    updateJobState({ selectedProperty: id });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">Where is your property</h2>
      <div className="bg-background p-4 rounded-md flex flex-row items-center gap-3">
        {/* 5. Update the Select component to use the new state */}
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
          disabled={isLoading || !!error} // Disable if loading or if there's an error
        />
        {/* Optional: Display an error message if the fetch fails */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="">
          <Button
            onClick={handleAddLocationClick}
            variant="primary"
            size="md"
          >
            Add location
          </Button>
        </div>
        {/* New Location Modal */}
        <NewLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNewLocation}
        />
      </div>
    </div>
  );
};

export default Property;
