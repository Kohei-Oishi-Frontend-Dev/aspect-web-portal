import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import BusinessInfoModal, { type BusinessInfoData } from "./BusinessInfoModal";

// Props interface for receiving data from the parent
interface BusinessInfoProps {
  data: {
    companyType: string;
    PORequirement: boolean;
    VATNumber: string;
    DRC: boolean;
    CISNumber: string;
  };
  onSave: (data: BusinessInfoData) => void;
}

const BusinessInfo: React.FC<BusinessInfoProps> = ({ data, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform prop data for display and modal initialization
  const businessDataForDisplay: BusinessInfoData = {
    companyType: data.companyType,
    poRequirement: data.PORequirement ? "Required" : "Not Required",
    vatRegistrationNumber: data.VATNumber,
    drcApplies: data.DRC ? "Yes" : "No",
    cisNumber: data.CISNumber,
  };

  const businessInfo = [
    { label: "Company Type", value: businessDataForDisplay.companyType },
    { label: "PO Requirement", value: businessDataForDisplay.poRequirement },
    {
      label: "VAT Registration Number",
      value: businessDataForDisplay.vatRegistrationNumber,
    },
    { label: "DRC Applies", value: businessDataForDisplay.drcApplies },
    { label: "CIS Number", value: businessDataForDisplay.cisNumber },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Business Information</h2>
      <div className="grid grid-cols-2 gap-4">
        {businessInfo.map((info, index) => (
          <div key={index} className="pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <b>{info.label}</b>
            </label>
            <div className="text-gray-900">{info.value || "-"}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-4 right-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        title="Edit Business Information"
      >
        <HugeiconsIcon icon={PencilEdit02Icon} className="w-7 h-7" />
      </button>

      <BusinessInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave} // Pass the save handler from the parent
        initialData={businessDataForDisplay}
      />
    </div>
  );
};

export default BusinessInfo;
