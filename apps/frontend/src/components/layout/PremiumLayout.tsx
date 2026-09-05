import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { CenteredSuccessModalContainer } from '../common/CenteredSuccessModal'
import './PremiumLayout.css'

export function PremiumLayout() {
  return (
    <div className="premium-layout">
      {/* Sidebar */}
      <Sidebar />

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




