import React, { useState, useEffect, useRef } from "react";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import { useAddressSearch } from "../../hooks/useAddressSearch";
import type { AddressSuggestion } from "../../hooks/useAddressSearch";

interface NewLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    addressLine1: string;
    addressLine2?: string;
    townCity?: string;
    county?: string;
    postCode?: string;
  }) => void;
}

const NewLocationModal: React.FC<NewLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [townCity, setTownCity] = useState("");
  const [county, setCounty] = useState("");
  const [postCode, setPostCode] = useState("");

  // NEW: local toggle to control visibility of the suggestion list
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Ref to ignore the next automatic open after selecting a suggestion
  const ignoreNextOpenRef = useRef(false);

  const { suggestions } = useAddressSearch(searchQuery);

  useEffect(() => {
    if (isOpen) {
      // reset fields when opening
      setSearchQuery("");
      setAddressLine1("");
      setAddressLine2("");
      setTownCity("");
      setCounty("");
      setPostCode("");
      setShowSuggestions(false);
      ignoreNextOpenRef.current = false;
    }
  }, [isOpen]);

  // Re-open suggestion box when the user types a new non-empty query
  useEffect(() => {
    if (ignoreNextOpenRef.current) {
      // skip one auto-open caused by programmatic setSearchQuery from a click
      ignoreNextOpenRef.current = false;
      setShowSuggestions(false);
      return;
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // split suggestion into address parts:
  const splitLocation = (text: string, description?: string) => {
    const addressLine1 = text || "";
    let addressLine2 = "";
    let postCode = "";

    if (description) {
      // split by space and trim
      const parts = description
        .split(" ")
        .map((p) => p.trim())
      console.log(parts);
      console.log(parts.length);
      if (parts.length >= 2) {
        // last two items => postcode
        const lastTwo = parts.slice(-2);
        postCode = lastTwo.join(" ");
        // remaining items => addressLine2
        addressLine2 = parts.slice(0, -2).join(", ");
      } else if (parts.length === 1) {
        // single item => postcode
        postCode = parts[0];
      }
    }

    return { addressLine1, addressLine2, postCode };
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    // prevent the searchQuery effect from immediately re-opening suggestions
    ignoreNextOpenRef.current = true;
    const { addressLine1: a1, addressLine2: a2, postCode: pc } = splitLocation(
      suggestion.text,
      suggestion.description
    );
    setAddressLine1(a1);
    setAddressLine2(a2);
    setPostCode(pc);
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!addressLine1.trim()) return; // basic validation
    onSave({
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      townCity: townCity.trim() || undefined,
      county: county.trim() || undefined,
      postCode: postCode.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 z-10 p-6">
        {/* header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-medium">Add new location</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="w-full p-3">
          {/* Search input */}
          <div className="relative">
            <TextInput
              label="Search address"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Start typing to search addresses"
              className="mb-1"
              name="addressSearch"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-auto z-20">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{s.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <TextInput
            label="Address Line 1"
            value={addressLine1}
            onChange={setAddressLine1}
            placeholder="e.g. 123 High Street"
            required
          />
          <TextInput
            label="Address Line 2"
            value={addressLine2}
            onChange={setAddressLine2}
            placeholder="Optional"
          />
          <TextInput
            label="Town / City"
            value={townCity}
            onChange={setTownCity}
            placeholder="e.g. London"
          />
          <TextInput
            label="County"
            value={county}
            onChange={setCounty}
            placeholder="Optional"
          />
          <TextInput
            label="Postcode"
            value={postCode}
            onChange={setPostCode}
            placeholder="e.g. SW1A 1AA"
          />
        </div>
        {/* footer */}
        <div className="flex justify-end gap-3 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save new place
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewLocationModal;
