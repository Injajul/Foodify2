import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// import Sidebar from "../components/home/Sidebar";


export default function AppMainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-background text-secondary overflow-hidden">
      <div className="flex flex-1">
        {/* <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        /> */}

        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-20"
          } pt-16 lg:pt-0`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}