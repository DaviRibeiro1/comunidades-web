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
        
        // Tenta recuperar a última comunidade selecionada do localStorage
        const savedId = localStorage.getItem('last_community_id')
        const found = data.find(c => String(c.id) === String(savedId))
        
        if (found) {
          setSelected(found)
        } else if (data.length && !selected) {
          setSelected(data[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, selected])

  useEffect(() => { load() }, [load])

  // Persiste o ID da comunidade selecionada sempre que ela mudar
  useEffect(() => {
    if (selected?.id) {
      localStorage.setItem('last_community_id', selected.id)
    }
  }, [selected])

  return { communities, selected, setSelected, loading, reload: load }
}
