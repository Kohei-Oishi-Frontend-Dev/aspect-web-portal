import React, { useState } from "react";
import { Link } from "react-router-dom"; // 1. Import Link
import MobileSideBar from "./MobileSideBar";
import navHeaderBackground from "../../assets/navheader-background.jpeg";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Settings01Icon,
  SquareUnlock02Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";

const NavHeader: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  // Basic logout function
  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    // You may also want to remove other session items
    window.location.href = "/login"; // Force a full redirect to clear state
  };

  return (
    <div
      className="w-full flex items-center justify-between px-4 bg-cover bg-center bg-no-repeat h-[10vh] md:h-[15vh]"
      style={{ backgroundImage: `url(${navHeaderBackground})` }}
    >
      <span className="text-lg text-accent"></span>
      <div className="lg:hidden">
        <MobileSideBar />
      </div>
      <div className="hidden lg:flex items-center gap-4">
        <button
          className="p-2 rounded-full border border-white bg-light-grey"
          aria-label="Settings"
        >
          <span className="text-lg">
            <HugeiconsIcon icon={Settings01Icon} />
          </span>
        </button>
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="p-2 rounded-full border border-white bg-light-grey"
            aria-label="Profile"
          >
            <span className="text-lg">
              <HugeiconsIcon icon={UserIcon} />
            </span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
              {/* 2. Changed from <a> to <Link> and pointing to /profile */}
              <Link
                to="/profile"
                onClick={closeUserMenu}
                className="flex items-center justify-start gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-md"
              >
                <HugeiconsIcon icon={UserSquareIcon} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-md"
              >
                <HugeiconsIcon icon={SquareUnlock02Icon} />
                Log-out
              </button>
            </div>
          )}
        </div>
      </div>
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeUserMenu} />
      )}
    </div>
  );
};

export default NavHeader;
