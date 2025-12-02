
import {Outlet} from "react-router-dom"
import  React from "react"

export default function AppAuthLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-black">
            <main className="flex-1 flex  items-center justify-center">
                <Outlet/> /
            </main>
        </div>
    )
}