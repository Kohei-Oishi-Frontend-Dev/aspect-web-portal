import React from "react";
import Settings from "./Settings";
import aspectLogo from "../../assets/aspect-logo-primary.svg";
import aspectLogoIcon from "../../assets/aspect-logo-icon.svg";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home03Icon,
  LicenseIcon,
  DeliveryTruck02Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";

const NavSideBar: React.FC = () => {
  const navMenuItems = [
    { name: "Home", path: "/home", icon: <HugeiconsIcon icon={Home03Icon} /> },
    { name: "Work", path: "/work", icon: <HugeiconsIcon icon={LicenseIcon} /> },
    {
      name: "New Job",
      path: "/new-job",
      icon: <HugeiconsIcon icon={DeliveryTruck02Icon} />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <HugeiconsIcon icon={Analytics01Icon} />,
    },
  ];

  return (
    <aside className="h-full bg-white flex flex-col">
      {/* Logo */}
      <div className="flex justify-center items-center px-4 py-6">
        <img
          src={aspectLogo}
          alt="Aspect"
          className="h-8 w-auto hidden lg:block"
        />
        <img
          src={aspectLogoIcon}
          alt="Aspect icon"
          className="h-8 w-auto lg:hidden"
        />
      </div>

      {/* Menu */}
      <nav className="px-2 py-4 flex flex-col items-center">
        <ul className="flex flex-col gap-1 w-full">
          {navMenuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.path}
                className="group flex items-center gap-3 w-full rounded-md px-4 py-2 text-[#1f2937] hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="hidden lg:inline">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings cluster pinned to bottom on large screens */}
      <div className="hidden lg:flex flex-col flex-1 justify-end">
        <Settings />
      </div>
    </aside>
  );
};

export default NavSideBar;
