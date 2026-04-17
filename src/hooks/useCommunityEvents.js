import { useEffect, useRef } from 'react'

const BASE_URL = 'https://web-production-8f5c4.up.railway.app'

export function useCommunityEvents(communityId, token, onServiceCreated) {
  const esRef = useRef(null)

  useEffect(() => {
    if (!communityId || !token) return

    // fecha conexão anterior
    esRef.current?.close()

    const url = `${BASE_URL}/events/community/${communityId}`
    const es  = new EventSource(`${url}?token=${token}`)
    esRef.current = es

    es.onmessage = (e) => {
      if (!e.data || e.data === 'heartbeat') return
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'service_created') {
          onServiceCreated({
            id:          event.service_id,
            icon:        event.icon,
            title:       event.title,
            description: event.description,
            price:       event.price,
            status:      event.status,
            requester:   { full_name: event.requester.full_name, email: event.requester.email }
          })
        }
      } catch (_) {}
    }

    es.onerror = () => {
      es.close()
      // reconecta após 3s
      setTimeout(() => {
        esRef.current = null
      }, 3000)
    }

    return () => es.close()
  }, [communityId, token])
}