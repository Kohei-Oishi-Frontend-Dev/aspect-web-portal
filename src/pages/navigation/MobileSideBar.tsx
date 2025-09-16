import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import Settings from "./Settings";

const TRANSITION_MS = 300;

const MobileSideBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // controls classes (open/closed)
  const [mounted, setMounted] = useState(false); // controls portal mount
  const timerRef = useRef<number | null>(null);

  // open: mount then set open to trigger transition
  const open = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMounted(true);
    // ensure class change happens after mount
    requestAnimationFrame(() => setIsOpen(true));
  };

  // close: start transition then unmount after duration
  const close = () => {
    setIsOpen(false);
    timerRef.current = window.setTimeout(() => {
      setMounted(false);
      timerRef.current = null;
    }, TRANSITION_MS);
  };

  const toggle = () => {
    if (mounted && isOpen) {
      close();
    } else {
      open();
    }
  };

  // body scroll lock while mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mounted) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mounted]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggle}
        className="p-2 rounded-lg border border-white bg-light-grey text-gray-600 hover:text-gray-900"
        aria-label="Open menu"
        aria-expanded={mounted && isOpen}
      >
        <HugeiconsIcon icon={Menu01Icon} />
      </button>

      {/* Portal mounted while animating open/close */}
      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 bg-black/30 z-[220] transition-opacity duration-300 ${
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={close}
              aria-hidden={true}
            />

            {/* Slide-out Sidebar (from right) */}
            <aside
              className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[230] ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="h-full overflow-y-auto">
                <Settings onClose={() => close()} />
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
};

export default MobileSideBar;
