// src/hooks/useCommunities.js
import { useState, useEffect, useCallback } from 'react'
import { communitiesApi } from '../api/services'
import { useAuth } from '../contexts/AuthContext'

export function useCommunities() {
  const { token } = useAuth()
  const [communities, setCommunities] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    communitiesApi.list(token)
      .then(data => {
        setCommunities(data)
        if (data.length && !selected) setSelected(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, selected])

  useEffect(() => { load() }, [load])

  return { communities, selected, setSelected, loading, reload: load }
}
