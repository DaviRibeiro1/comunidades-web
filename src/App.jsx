// src/App.jsx
import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { AcceptInvitePage } from './pages/auth/AcceptInvitePage'
import { useToast } from './contexts/ToastContext'
import { useCommunities } from './hooks/useCommunities'
import { useNotifications } from './hooks/useNotifications'

import { Sidebar } from './components/layout/Sidebar'
import { LoginPage } from './pages/auth/LoginPage'
import { RequestCommunityPage } from './pages/auth/RequestCommunityPage'

// Shared
import { HomePage } from './pages/shared/HomePage'
import { NotificationsPage } from './pages/shared/NotificationsPage'

// Owner
import { PendingRequestsPage } from './pages/owner/PendingRequestsPage'
import { AllCommunitiesPage } from './pages/owner/AllCommunitiesPage'

// Manager
import { InviteMembersPage } from './pages/manager/InviteMembersPage'
import { ManageMembersPage } from './pages/manager/ManageMembersPage'
import { ManageServicesPage } from './pages/manager/ManageServicesPage'

// Member
import { MyServicesPage } from './pages/member/MyServicesPage'
import { MyApplicationsPage } from './pages/member/MyApplicationsPage'

function AuthenticatedApp() {
  const { user, logout } = useAuth()
  const { communities, selected, setSelected } = useCommunities()
  const { notifications, unreadCount, markOne, markAll } = useNotifications()
  const [page, setPage] = useState('home')

  function renderPage() {
    switch (page) {
      case 'home':            return <HomePage community={selected} />
      case 'pending':         return <PendingRequestsPage />
      case 'all_communities': return <AllCommunitiesPage />
      case 'invite':          return <InviteMembersPage community={selected} />
      case 'members':         return <ManageMembersPage community={selected} />
      case 'manage_services': return <ManageServicesPage community={selected} />
      case 'my_services':     return <MyServicesPage community={selected} />
      case 'my_applications': return <MyApplicationsPage />
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            onMarkAll={markAll}
            onMarkOne={markOne}
          />
        )
      default: return <HomePage community={selected} />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        communities={communities}
        selectedCommunity={selected}
        setSelectedCommunity={c => { setSelected(c); setPage('home') }}
        onLogout={logout}
        unreadCount={unreadCount}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const [screen, setScreen] = useState('login')

  // ← detecta token de convite na URL
  const params     = new URLSearchParams(window.location.search)
  const inviteToken = params.get('token')

  if (inviteToken) return <AcceptInvitePage token={inviteToken} />
  if (isAuthenticated) return <AuthenticatedApp />
  if (screen === 'request') return <RequestCommunityPage onBack={() => setScreen('login')} />
  return <LoginPage onGoRequest={() => setScreen('request')} />
}
