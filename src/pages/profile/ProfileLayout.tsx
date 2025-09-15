import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, LockIcon } from "@hugeicons/core-free-icons";
import Button from "../../components/Button";

interface ProfileData {
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string;
  contactId: string;
  companyNumber: string | null;
  addressPostcode: string | null;
  addressCounty: string | null;
  addressCity: string | null;
  addressLine: string | null;
  accountName: string;
  accountType: string;
  accountId: string;
  sectorType?: string;
  userAccess?: string;
  message?: string;
  status: string;
  statusCode: number;
}

/* ---- Figma tokens from your screenshots ---- */
const BLUE = "#27549D"; // Surface/Default
const SUBTITLE = "#646F86"; // Greyscale/Text/Subtitle
const BORDER_SUBTLE = "#DEE8F7"; // Border/Subtle

/* ---- Card that matches Figma ---- */
const FigmaCard: React.FC<
  React.PropsWithChildren<{ className?: string; onEdit?: () => void }>
> = ({ className = "", onEdit, children }) => (
  <div
    className={[
      "relative bg-white rounded-[12px]",
      "border-[0.5px]",
      "shadow-[0_2px_4px_rgba(50,56,67,0.08)]",
      className,
    ].join(" ")}
    style={{ borderColor: BORDER_SUBTLE }}
  >
    {/* content */}
    <div className="p-6">{children}</div>

    {/* edit icon (bottom-right, outlined blue square w/ icon) */}
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit"
      className="absolute bottom-4 right-4 h-9 w-9 rounded-lg grid place-items-center border text-[#27549D] border-[#27549D] hover:bg-[#EEF3FB] transition"
    >
      <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
    </button>
  </div>
);

/* One stacked field group: blue label (13/800) then grey value (13/600) */
const StackField: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="space-y-1">
    <p
      className="text-[13px] leading-none font-extrabold"
      style={{ color: BLUE }}
    >
      {label}
    </p>
    <p
      className="text-[13px] leading-none font-semibold"
      style={{ color: SUBTITLE }}
    >
      {value ?? "—"}
    </p>
  </div>
);

const ProfileLayout: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const userId = sessionStorage.getItem("userId");

      if (!authToken || !userId) {
        setError("You are not logged in. Please log in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/profile-api/services/apexrest/Profile?userId=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }

        const data = await response.json();
        if (response.ok && data.statusCode === 200) {
          setProfile(data);
        } else {
          throw new Error(data.message || "Failed to fetch profile data.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="w-full">
      {/* ---- Hero strip (ignore exact image; align heading like Figma) ---- */}
      <div className="relative h-44 w-full bg-gradient-to-r from-blue-200/40 to-indigo-200/40">
        <div className="absolute left-8 bottom-3 flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-[#D3E000]" />
          <span className="text-[22px] font-extrabold" style={{ color: BLUE }}>
            Profile
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* simple loading blocks */}
            <div
              className="h-48 rounded-[12px] bg-white border-[0.5px]"
              style={{ borderColor: BORDER_SUBTLE }}
            />
            <div
              className="h-48 rounded-[12px] bg-white border-[0.5px]"
              style={{ borderColor: BORDER_SUBTLE }}
            />
            <div
              className="h-48 rounded-[12px] bg-white border-[0.5px]"
              style={{ borderColor: BORDER_SUBTLE }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : profile ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NAME CARD — stacked lines exactly like Figma */}
              <FigmaCard>
                <div className="space-y-4">
                  {/* Title inside card (blue 13/bold) */}
                  <p
                    className="text-[13px] font-extrabold"
                    style={{ color: BLUE }}
                  >
                    Name
                  </p>

                  {/* Name value (a tad larger / darker than the 13s) */}
                  <p className="text-[15px] font-semibold text-gray-900">
                    {profile.contactName}
                  </p>

                  {/* Stacked fields: Account ID, Account type */}
                  <div className="space-y-4">
                    <StackField label="Account ID" value={profile.accountId} />
                    <StackField
                      label="Account type"
                      value={profile.accountType}
                    />
                  </div>
                </div>
              </FigmaCard>

              {/* ADDRESS CARD — title + multiline address lines (stacked) */}
              <FigmaCard>
                <div className="space-y-4">
                  <p
                    className="text-[13px] font-extrabold"
                    style={{ color: BLUE }}
                  >
                    Account address
                  </p>

                  <div className="space-y-2">
                    {/* first line (bold-ish, darker like Figma) */}
                    <p className="text-[15px] font-semibold text-gray-900">
                      {profile.addressLine || "—"}
                    </p>
                    {/* rest stacked with grey 13/600 */}
                    {[
                      profile.addressCity,
                      profile.addressCounty,
                      profile.addressPostcode,
                    ]
                      .filter(Boolean)
                      .map((line, i) => (
                        <p
                          key={i}
                          className="text-[13px] font-semibold"
                          style={{ color: SUBTITLE }}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              </FigmaCard>

              {/* CONTACT DETAILS CARD — stacked like Figma */}
              <FigmaCard>
                <div className="space-y-4">
                  <p
                    className="text-[13px] font-extrabold"
                    style={{ color: BLUE }}
                  >
                    Contact details
                  </p>

                  <p className="text-[15px] font-semibold text-gray-900">
                    {profile.contactName}
                  </p>

                  <div className="space-y-4">
                    <StackField
                      label="Phone"
                      value={profile.contactPhone || "—"}
                    />
                    <StackField
                      label="Email"
                      value={profile.contactEmail || "—"}
                    />
                  </div>
                </div>
              </FigmaCard>
            </div>

            {/* Login details chip/button */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-[12px] border-[0.5px] border-[#27549D] text-[#27549D] hover:bg-[#EEF3FB] px-4 py-2 inline-flex items-center gap-2"
              >
                <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
                <span className="text-[13px] font-semibold">Login details</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No profile data found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileLayout;
