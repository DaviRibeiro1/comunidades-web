// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react'
import { notificationsApi } from '../api/services'
import { useAuth } from '../contexts/AuthContext'

export function useNotifications() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])

  const load = useCallback(() => {
    if (!token) return
    notificationsApi.list(token).then(setNotifications).catch(() => {})
  }, [token])

  useEffect(() => { load() }, [load])

  async function markOne(id) {
    await notificationsApi.markRead(token, id)
    setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAll() {
    await notificationsApi.markAllRead(token)
    setNotifications(p => p.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return { notifications, unreadCount, markOne, markAll, reload: load }
}
