import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import banner from "../../assets/7b36db813382101e06e5148a7336319b009ec7b5.jpg";
import NavHeader from "../navigation/NavHeader";
import userLogo from "../../assets/User_rectangle_1.svg";
import SvgIcon from "../../components/SvgIcon";
import login_details from "../../assets/login_details.svg";
import AccountInfoCard from "./AccountInfoCard";
import ContactDetailCard from "./ContactDetailCard";
import AccountAddressCard from "./AccountAddressCard";

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

const ProfileLayout: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BORDER_SUBTLE = "#DEE8F7";
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
      } catch (err: object) {
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
        <div className="relative z-0 py-6 px-4 bg-bg-bakground min-h-screen">
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
              <div className="grid grid-cols-1 gap-6 sm:max-w-fit ">
                {/* LEFT COLUMN */}
                <AccountInfoCard
                  contactName={profile.contactName}
                  accountId={profile.accountId}
                  accountType={profile.accountType}
                  onEdit={() => {
                    /* handle edit account info */
                  }}
                />
                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <AccountAddressCard
                    addressLine={profile.addressLine}
                    addressCity={profile.addressCity}
                    addressCounty={profile.addressCounty}
                    addressPostcode={profile.addressPostcode}
                    onEdit={() => {
                      /* handle edit address */
                    }}
                  />
                  <ContactDetailCard
                    contactName={profile.contactName}
                    contactPhone={profile.contactPhone}
                    contactEmail={profile.contactEmail}
                    onEdit={() => {
                      /* handle edit contact details */
                    }}
                  />
                </div>
              </div>

              {/* Login details button */}
              <div className="mt-6">
                <Button className="bg-transparent">
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
