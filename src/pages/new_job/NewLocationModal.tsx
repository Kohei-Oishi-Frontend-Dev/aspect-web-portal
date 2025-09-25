import React, { useState, useEffect } from "react";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [townCity, setTownCity] = useState("");
  const [county, setCounty] = useState("");
  const [postCode, setPostCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      // reset fields when opening
      setSearchQuery("");
      setSuggestions([]);
      setAddressLine1("");
      setAddressLine2("");
      setTownCity("");
      setCounty("");
      setPostCode("");
    }
  }, [isOpen]);

  // NEW: call Addressy whenever searchQuery changes (debounced + abortable)
  useEffect(() => {
    if (!isOpen) return; // only run while modal open
    if (!searchQuery || !searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          Key: "JJ18-CG38-MK69-DA98",
          Text: searchQuery.trim(),
        });
        const url = `https://api.addressy.com/Capture/Interactive/Find/v1.10/json6.ws?${params.toString()}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          console.error("Address lookup failed", res.status);
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        // Extract array (API may use Items / Results / Places)
        const items = data?.Items ?? data?.Results ?? data?.Places ?? [];
        // Map each element to its 'text' key (fall back to 'Text' if needed)
        const texts: string[] = items
          .map((it: any) => it?.text ?? it?.Text ?? null)
          .filter(Boolean);
        console.log("Addressy suggestions:", texts);
        setSuggestions(texts);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Address lookup error:", err);
        setSuggestions([]);
      }
    }, 300); // debounce 300ms

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSuggestionClick = (value: string) => {
    setAddressLine1(value);
    setSearchQuery(value);
    setSuggestions([]);
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

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b">
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
        <div className="p-8 space-y-3">
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
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-auto z-20">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s}-${i}`}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {s}
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
        <div className="flex justify-end gap-3 p-4 border-t">
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
