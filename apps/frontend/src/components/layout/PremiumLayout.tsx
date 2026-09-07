import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { CenteredSuccessModalContainer } from '../common/CenteredSuccessModal'
import './PremiumLayout.css'

export function PremiumLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={`premium-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Centered Success Modal Container */}
      <CenteredSuccessModalContainer />
    </div>
  )
}




