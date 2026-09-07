import { useCallback, useEffect, useState } from 'react'
import { Check, HandHelping, RefreshCw, ShieldAlert } from 'lucide-react'
import { apiRequest } from '../../services/apiClient'
import { getCases } from '../../services/caseService'
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
    try { const [visits, alerts] = await Promise.all([getCases(), apiRequest<HelpRequest[]>('/api/v1/attendant-requests')]); setCases(visits); setRequests(alerts); setError(''); setOnline(true) }
    catch { setOnline(false); setError(hi ? 'कनेक्शन नहीं हो पाया। फिर कोशिश करें।' : 'Could not connect. Please retry.') }
  }, [hi])
  useEffect(() => { void load(); const timer = setInterval(load, 5000); return () => clearInterval(timer) }, [load])
  const acknowledge = async (id: string) => {
    setBusy(id)
    try { await apiRequest(`/api/v1/attendant-requests/${id}`, { method: 'PATCH', body: '{}' }); await load() }
    catch { setError(t('अनुरोध अपडेट नहीं हुआ। फिर कोशिश करें।', 'Could not update the request. Please retry.')) }
    finally { setBusy('') }
  }
  return <div className="section-enter"><div className="section-heading"><div><p className="eyebrow">{t('स्टाफ कार्यस्थल', 'Staff workspace')}</p><h1>{t('कियोस्क की गतिविधि', 'Kiosk activity')}</h1><p>{t('मरीज़ों के सहायता अनुरोध और केस की स्थिति।', 'Patient help requests and case status.')}</p></div><button className="secondary-button" onClick={() => void load()}><RefreshCw/>{t('रीफ़्रेश', 'Refresh')}</button></div>{error && <div role="alert" className="inline-error">{error}</div>}<div className="stats-grid">{[[t('भेजे गए केस', 'Submitted visits'), cases.length], [t('समीक्षा बाकी', 'Awaiting review'), cases.filter(item => item.status === 'submitted').length], [t('प्राथमिकता केस', 'Priority cases'), cases.filter(item => item.urgent && item.status === 'submitted').length], [t('सहायता अनुरोध', 'Help requests'), requests.length]].map(([label, value]) => <div className="stat-card" key={label}><p>{label}</p><strong>{value}</strong></div>)}</div><section className="flow-card staff-requests"><div className="case-heading"><h2>{t('सहायता की ज़रूरत', 'Patients needing help')}</h2><span className={`status-badge ${online ? 'approved' : 'urgent'}`}>{online ? t('कनेक्टेड', 'Connected') : t('कनेक्शन नहीं', 'Disconnected')}</span></div>{requests.length === 0 ? <div className="empty-state"><HandHelping size={40}/><p>{t('अभी कोई लंबित सहायता अनुरोध नहीं है।', 'There are no pending help requests.')}</p></div> : requests.map(request => <div className="staff-request" key={request.requestId}>{request.urgent ? <ShieldAlert className="text-red-600"/> : <HandHelping/>}<div><p>{request.reason}</p><span>{new Date(request.createdAt).toLocaleTimeString(hi ? 'hi-IN' : 'en-IN')}</span></div><button disabled={!!busy} className="secondary-button" onClick={() => void acknowledge(request.requestId)}><Check/>{t('मदद के लिए जा रहे हैं', 'Attend to patient')}</button></div>)}</section></div>
}
