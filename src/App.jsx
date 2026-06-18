// src/App.jsx — versão limpa
import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useCommunities } from './hooks/useCommunities'
import { useNotifications } from './hooks/useNotifications'
import { Sidebar } from './components/layout/Sidebar'
import { LoginPage } from './pages/auth/LoginPage'
import { RequestCommunityPage } from './pages/auth/RequestCommunityPage'
import { AcceptInvitePage } from './pages/auth/AcceptInvitePage'
import { HomePage } from './pages/shared/HomePage'
import { MyCommunitiesPage } from './pages/shared/MyCommunitiesPage'
import { ManageCommunityPage } from './pages/shared/ManageCommunityPage'
import { NotificationsPage } from './pages/shared/NotificationsPage'
import { PendingRequestsPage } from './pages/owner/PendingRequestsPage'
import { AllCommunitiesPage } from './pages/owner/AllCommunitiesPage'
import { MyServicesPage } from './pages/member/MyServicesPage'
import { MyApplicationsPage } from './pages/member/MyApplicationsPage'

function AuthenticatedApp() {
  const { user, logout }                                          = useAuth()
  const { communities, selected, setSelected, reload: reloadCommunities } = useCommunities()
  const { notifications, unreadCount, markOne, markAll, reload: reloadNotifications } = useNotifications()
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('promotion') ? 'notifications' : 'home'
  })

  const promotionToken = new URLSearchParams(window.location.search).get('promotion')

  const effectiveRole = selected?.my_role || user?.global_role || 'MEMBER'

  function renderPage() {
    switch (page) {
      case 'home':
        return <HomePage community={selected} />

      case 'my_communities':
        return (
          <MyCommunitiesPage
            communities={communities}
            onSelectCommunity={c => { setSelected(c); setPage('home') }}
          />
        )

      case 'manage_community':
        return (
          <ManageCommunityPage
            community={selected}
            currentRole={effectiveRole}
            onDeleted={() => { reloadCommunities(); setPage('home') }}
          />
        )

      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            communities={communities}
            onMarkAll={markAll}
            onMarkOne={markOne}
            onCommunitiesReload={reloadCommunities}
            onNotificationsReload={reloadNotifications}
            initialPromotionToken={promotionToken}
          />
        )

      case 'pending':         return <PendingRequestsPage />
      case 'all_communities': return <AllCommunitiesPage />
      case 'my_services':     return <MyServicesPage community={selected} />
      case 'my_applications': return <MyApplicationsPage />
      default:                return <HomePage community={selected} />
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

  const params      = new URLSearchParams(window.location.search)
  const inviteToken = params.get('token')

  if (inviteToken)      return <AcceptInvitePage token={inviteToken} />
  if (isAuthenticated)  return <AuthenticatedApp />
  if (screen === 'request') return <RequestCommunityPage onBack={() => setScreen('login')} />
  return <LoginPage onGoRequest={() => setScreen('request')} />
}