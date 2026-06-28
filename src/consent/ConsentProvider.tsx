import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ConsentPreferences {
  /** Essential cookies — always true, cannot be disabled. */
  essential: true
  /** Error reporting (e.g. Sentry). */
  errorReporting: boolean
  /** Performance / Web Vitals reporting. */
  performanceReporting: boolean
  /** Analytics / usage tracking. */
  analytics: boolean
}

interface ConsentContextType {
  preferences: ConsentPreferences
  hasConsented: boolean
  updatePreferences: (prefs: Partial<Omit<ConsentPreferences, 'essential'>>) => void
  acceptAll: () => void
  rejectAll: () => void
}

const DEFAULT_CONSENT_KEY = 'suite-consent'

const defaultPreferences: ConsentPreferences = {
  essential: true,
  errorReporting: false,
  performanceReporting: false,
  analytics: false,
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

function loadPreferences(storageKey: string): { prefs: ConsentPreferences; consented: boolean } {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentPreferences
      return { prefs: { ...defaultPreferences, ...parsed, essential: true }, consented: true }
    }
  } catch {
    // Corrupted storage — treat as no consent.
  }
  return { prefs: defaultPreferences, consented: false }
}

export interface ConsentProviderProps {
  children: ReactNode
  /** localStorage key for persisted preferences (per app). */
  storageKey?: string
}

export function ConsentProvider({ children, storageKey = DEFAULT_CONSENT_KEY }: ConsentProviderProps) {
  const [{ prefs, consented }, setState] = useState(() => loadPreferences(storageKey))

  useEffect(() => {
    if (consented) localStorage.setItem(storageKey, JSON.stringify(prefs))
  }, [prefs, consented, storageKey])

  const updatePreferences = useCallback(
    (partial: Partial<Omit<ConsentPreferences, 'essential'>>) => {
      setState((prev) => ({
        prefs: { ...prev.prefs, ...partial, essential: true },
        consented: true,
      }))
    },
    [],
  )

  const acceptAll = useCallback(() => {
    setState({
      prefs: { essential: true, errorReporting: true, performanceReporting: true, analytics: true },
      consented: true,
    })
  }, [])

  const rejectAll = useCallback(() => {
    setState({ prefs: defaultPreferences, consented: true })
  }, [])

  return (
    <ConsentContext.Provider
      value={{
        preferences: prefs,
        hasConsented: consented,
        updatePreferences,
        acceptAll,
        rejectAll,
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent(): ConsentContextType {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within a ConsentProvider')
  return ctx
}
