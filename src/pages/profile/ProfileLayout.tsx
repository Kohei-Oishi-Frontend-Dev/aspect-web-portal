import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import banner from "../../assets/7b36db813382101e06e5148a7336319b009ec7b5.jpg";
import NavHeader from "../navigation/NavHeader";
import userLogo from "../../assets/User_rectangle_1.svg";
import SvgIcon from "../../components/SvgIcon";
import edit from "../../assets/edit.svg";
import login_details from "../../assets/login_details.svg";

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

const BLUE = "#27549D";
const SUBTITLE = "#646F86";
const BORDER_SUBTLE = "#DEE8F7";

const FigmaCard: React.FC<
  React.PropsWithChildren<{ className?: string; onEdit?: () => void }>
> = ({ className = "", onEdit, children }) => (
  <div
    className={[
      "relative bg-white rounded-[12px] border-[0.5px]",
      "shadow-[0_2px_4px_rgba(50,56,67,0.08)]",
      "w-full md:aspect-square md:max-w-[360px] overflow-hidden",
      className,
    ].join(" ")}
    style={{ borderColor: BORDER_SUBTLE }}
  >
    <div className="p-6 pb-14 h-full">{children}</div>
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit"
      className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-lg border border-[#27549D] text-[#27549D] hover:bg-[#EEF3FB] transition"
    >
      <img src={edit} alt="Edit" className="h-5 w-5" />
    </button>
  </div>
);

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
      <div>
        {/* HERO BANNER */}
        <div
          className="relative w-full h-[130px] z-10 grid grid-cols-2 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${banner})` }}
          role="img"
          aria-label="Profile header"
        >
          <div className="absolute inset-0 pointer-events-none bg-[#27549D]/50" />
          <div className="p-8 flex items-end">
            <p className="text-accent text-xl leading-none z-50 flex gap-2 items-center">
              <SvgIcon svg={userLogo} size={20} className="inline-block" />
              Profile
            </p>
          </div>
          <div className="pt-4 pointer-events-auto relative z-[120]">
            <NavHeader />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative z-0 py-6 px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-[12px] bg-white border-[0.5px] animate-pulse"
                  style={{ borderColor: BORDER_SUBTLE }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : profile ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6">
                  {/* Name / Account Card */}
                  <FigmaCard>
                    <div className="space-y-6">
                      <StackField label="Name" value={profile.contactName} />
                      <StackField
                        label="Account ID"
                        value={profile.accountId}
                      />
                      <StackField
                        label="Account type"
                        value={profile.accountType}
                      />
                    </div>
                  </FigmaCard>

                  {/* Contact Details Card */}
                  <FigmaCard>
                    <div className="space-y-4">
                      <p
                        className="text-[13px] font-extrabold"
                        style={{ color: BLUE }}
                      >
                        Contact details
                      </p>
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: SUBTITLE }}
                        >
                          {profile.contactName}
                        </p>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: SUBTITLE }}
                        >
                          {profile.contactPhone || "—"}
                        </p>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: SUBTITLE }}
                        >
                          {profile.contactEmail || "—"}
                        </p>
                      </div>
                    </div>
                  </FigmaCard>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col">
                  <FigmaCard>
                    <div className="space-y-4">
                      <p
                        className="text-[13px] font-extrabold"
                        style={{ color: BLUE }}
                      >
                        Account address
                      </p>
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: SUBTITLE }}
                        >
                          {profile.addressLine || "—"}
                        </p>
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
                </div>
              </div>

              {/* Login details button */}
              <div className="mt-6">
                <Button>
                  <img src={login_details} alt="Login details" />
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No profile data found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
