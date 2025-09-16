import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileSideBar from "./MobileSideBar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Settings01Icon,
  SquareUnlock02Icon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";

const NavHeader: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toggleUserMenu = () => setUserMenuOpen((s) => !s);
  const closeUserMenu = () => setUserMenuOpen(false);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="w-full h-16 md:h-16 flex items-center justify-between px-6 md:px-8 relative z-[100]">
      {/* left spacer for brand in sidebar */}
      <span />

      {/* mobile: hamburger / side drawer */}
      <div className="lg:hidden">
        <MobileSideBar />
      </div>

      {/* right icons */}
      <div className="hidden lg:flex items-center gap-3">
        <button
          className="p-2 rounded-full border border-transparent hover:bg-gray-100"
          aria-label="Settings"
        >
          <HugeiconsIcon icon={Settings01Icon} />
        </button>

        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="p-2 rounded-full border border-transparent hover:bg-gray-100"
            aria-label="Profile"
          >
            <HugeiconsIcon icon={UserIcon} />
          </button>

          {userMenuOpen && (
            <>
              {/* click-away backdrop */}
              <button
                className="fixed inset-0 z-[100] cursor-default"
                aria-hidden
                onClick={closeUserMenu}
              />
              {/* dropdown menu */}
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-[110] overflow-hidden border border-gray-100">
                <Link
                  to="/profile"
                  onClick={closeUserMenu}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <HugeiconsIcon icon={UserSquareIcon} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50"
                >
                  <HugeiconsIcon icon={SquareUnlock02Icon} />
                  Log-out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
