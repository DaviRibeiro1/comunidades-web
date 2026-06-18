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

        const savedId = localStorage.getItem('last_community_id')
        const found = data.find(c => String(c.id) === String(savedId))

        setSelected(prev => {
          if (found) return found
          if (prev && data.some(c => String(c.id) === String(prev.id))) return prev
          return data.length ? data[0] : null
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  // Persiste o ID da comunidade selecionada sempre que ela mudar
  useEffect(() => {
    if (selected?.id) {
      localStorage.setItem('last_community_id', selected.id)
    }
  }, [selected])

  return { communities, selected, setSelected, loading, reload: load }
}
