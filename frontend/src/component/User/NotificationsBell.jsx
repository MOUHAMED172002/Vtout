import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const notifications = []; // Mock empty until backend endpoint exists
  const unread = 0;

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-circle"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <div className="indicator">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unread > 0 && <span className="badge badge-sm indicator-item">{unread}</span>}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 p-3 shadow rounded z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Notifications</div>
          </div>
          <div className="p-4 text-center text-sm text-gray-500">
            Aucune notification pour le moment.
          </div>
        </div>
      )}
    </div>
  );
}