// src/hooks/useCommunities.js
import { useState, useEffect } from 'react'
import { communitiesApi } from '../api/services'
import { useAuth } from '../contexts/AuthContext'

export function useCommunities() {
  const { token } = useAuth()
  const [communities, setCommunities] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    communitiesApi.list(token)
      .then(data => {
        setCommunities(data)
        if (data.length) setSelected(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return { communities, selected, setSelected, loading }
}
