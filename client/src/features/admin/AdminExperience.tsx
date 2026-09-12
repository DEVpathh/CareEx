import { useCallback, useEffect, useState } from 'react'
import { Check, CheckCircle2, HandHelping, RefreshCw, ShieldAlert, User, XCircle } from 'lucide-react'
import { apiRequest } from '../../services/apiClient'
import { getCases, updateCase } from '../../services/caseService'
import type { CaseDraft } from '../../types/clinical'

type HelpRequest = { requestId: string; reason: string; urgent: boolean; createdAt: string; status: string }

export function AdminExperience({ language }: { language: string }) {
  const hi = language !== 'English'
  const t = (hindi: string, english: string) => hi ? hindi : english
  const [cases, setCases] = useState<CaseDraft[]>([])
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [online, setOnline] = useState(false)

  const load = useCallback(async () => {
    try {
      const [visits, alerts] = await Promise.all([getCases(), apiRequest<HelpRequest[]>('/api/v1/attendant-requests')])
      setCases(visits)
      setRequests(alerts)
      setError('')
      setOnline(true)
    } catch {
      setOnline(false)
      setError(hi ? 'कनेक्शन नहीं हो पाया। फिर कोशिश करें।' : 'Could not connect. Please retry.')
    }
  }, [hi])

  useEffect(() => {
    void load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [load])

  const acknowledge = async (id: string) => {
    setBusy(id)
    try {
      await apiRequest(`/api/v1/attendant-requests/${id}`, { method: 'PATCH', body: '{}' })
      await load()
    } catch {
      setError(t('अनुरोध अपडेट नहीं हुआ। फिर कोशिश करें।', 'Could not update the request. Please retry.'))
    } finally {
      setBusy('')
    }
  }

  const handleCaseStatus = async (caseId: string, status: 'approved' | 'rejected') => {
    setBusy(caseId)
    try {
      await updateCase(caseId, { status })
      await load()
    } catch {
      setError(t('केस स्टेटस अपडेट नहीं हो पाया।', 'Could not update case status.'))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="section-enter">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t('स्टाफ कार्यस्थल', 'Staff workspace')}</p>
          <h1>{t('कियोस्क की गतिविधि', 'Kiosk activity')}</h1>
          <p>{t('मरीज़ों के सहायता अनुरोध और केस की स्थिति।', 'Patient help requests and case status.')}</p>
        </div>
        <button className="secondary-button" onClick={() => void load()}><RefreshCw/>{t('रीफ़्रेश', 'Refresh')}</button>
      </div>

      {error && <div role="alert" className="inline-error">{error}</div>}

      <div className="stats-grid">
        {[[t('भेजे गए केस', 'Submitted visits'), cases.length], [t('समीक्षा बाकी', 'Awaiting review'), cases.filter(item => item.status === 'submitted').length], [t('प्राथमिकता केस', 'Priority cases'), cases.filter(item => item.urgent && item.status === 'submitted').length], [t('सहायता अनुरोध', 'Help requests'), requests.length]].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="flow-card staff-requests mb-6">
        <div className="case-heading">
          <h2>{t('मरीज़ों की सूची (स्वीकृति / अस्वीकृति)', 'Patient Queue (Approve / Decline)')}</h2>
          <span className="status-badge approved">{cases.length} {t('कुल केस', 'total cases')}</span>
        </div>
        {cases.length === 0 ? (
          <div className="empty-state">
            <User size={40}/>
            <p>{t('कोई मरीज़ केस दर्ज नहीं है।', 'No patient cases submitted yet.')}</p>
          </div>
        ) : (
          <div className="patient-queue-list space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {cases.map(item => (
              <div key={item.id} className="staff-request" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-elevated, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <User size={28} className="text-primary"/>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                      {item.patient?.displayName || t('अज्ञात मरीज़', 'Unknown Patient')} ({item.patient?.age ?? '?'} {t('वर्ष', 'yrs')}, {item.patient?.sex || '-'})
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                      <strong>{t('लक्षण:', 'Symptoms:')}</strong> {item.chiefComplaint || item.bodyLocations?.join(', ') || t('कोई नहीं', 'None')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`status-badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'urgent' : 'pending'}`}>
                    {item.status ? item.status.toUpperCase() : 'SUBMITTED'}
                  </span>
                  {item.status !== 'approved' && (
                    <button
                      disabled={busy === item.id}
                      className="primary-button"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => void handleCaseStatus(item.id, 'approved')}
                    >
                      <CheckCircle2 size={16} />
                      {t('स्वीकृत करें', 'Approve')}
                    </button>
                  )}
                  {item.status !== 'rejected' && (
                    <button
                      disabled={busy === item.id}
                      className="secondary-button"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => void handleCaseStatus(item.id, 'rejected')}
                    >
                      <XCircle size={16} />
                      {t('अस्वीकार करें', 'Decline')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flow-card staff-requests">
        <div className="case-heading">
          <h2>{t('सहायता की ज़रूरत', 'Patients needing help')}</h2>
          <span className={`status-badge ${online ? 'approved' : 'urgent'}`}>{online ? t('कनेक्टेड', 'Connected') : t('कनेक्शन नहीं', 'Disconnected')}</span>
        </div>
        {requests.length === 0 ? (
          <div className="empty-state">
            <HandHelping size={40}/>
            <p>{t('अभी कोई लंबित सहायता अनुरोध नहीं है।', 'There are no pending help requests.')}</p>
          </div>
        ) : (
          requests.map(request => (
            <div className="staff-request" key={request.requestId}>
              {request.urgent ? <ShieldAlert className="text-red-600"/> : <HandHelping/>}
              <div>
                <p>{request.reason}</p>
                <span>{new Date(request.createdAt).toLocaleTimeString(hi ? 'hi-IN' : 'en-IN')}</span>
              </div>
              <button disabled={!!busy} className="secondary-button" onClick={() => void acknowledge(request.requestId)}><Check/>{t('मदद के लिए जा रहे हैं', 'Attend to patient')}</button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

