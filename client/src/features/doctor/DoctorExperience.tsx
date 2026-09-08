import { FollowupPanel } from '../../components/FollowupPanel'
import { DocumentTimeline } from '../../components/DocumentTimeline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Activity, Check, ClipboardCheck, Download, FileText, LoaderCircle, Pencil, RefreshCw, Save, Search, ShieldAlert, X } from 'lucide-react'
import { getCases, getFhirBundle, updateCase } from '../../services/caseService'
import { TridoshaRadar } from '../../components/TridoshaRadar'
import type { CaseDraft } from '../../types/clinical'

const editableFields = [
  ['chiefComplaint', 'मुख्य परेशानी', 'Chief complaint'], ['hpi', 'बीमारी का विवरण', 'History of present illness'],
  ['pastHistory', 'पुरानी बीमारियां', 'Past medical history'], ['drugAndAllergy', 'दवाएं और एलर्जी', 'Medicines & allergies'],
  ['familyHistory', 'पारिवारिक इतिहास', 'Family history'], ['ros', 'अन्य लक्षण', 'Other symptoms'], ['clinicianNotes', 'डॉक्टर के नोट्स / निर्णय का कारण', 'Clinician notes / decision reason'],
] as const

export function DoctorExperience({ language }: { language: string }) {
  const hi = language !== 'English'
  const t = (hindi: string, english: string) => hi ? hindi : english
  const [cases, setCases] = useState<CaseDraft[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<CaseDraft | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const alive = useRef(true)
  const current = cases.find(item => item.id === selectedId)
  const load = useCallback(async () => {
    try {
      const data = await getCases()
      if (!alive.current) return
      setCases(data); setSelectedId(id => data.some(item => item.id === id) ? id : data[0]?.id ?? '')
      setError(previous => previous.startsWith('Connection') || previous.startsWith('कनेक्शन') ? '' : previous)
    } catch { if (alive.current) setError(hi ? 'कनेक्शन नहीं हो पाया। फिर लोड करें।' : 'Connection failed. Reload to try again.') }
    finally { if (alive.current) setLoading(false) }
  }, [hi])
  useEffect(() => { alive.current = true; void load(); const interval = setInterval(load, 5000); return () => { alive.current = false; clearInterval(interval) } }, [load])
  useEffect(() => { if (!editing) setDraft(current ?? null) }, [current, editing])
  const select = (id: string) => { if (editing || saving) return; setSelectedId(id); setMessage(''); setError('') }
  const save = async (status?: CaseDraft['status']) => {
    if (!draft || saving) return
    if (status === 'rejected' && !draft.clinicianNotes?.trim()) { setEditing(true); setError(t('केस अस्वीकार करने का कारण डॉक्टर के नोट्स में लिखें।', 'Add a reason in clinician notes before rejecting this case.')); return }
    setSaving(true); setError(''); setMessage('')
    try {
      const update = Object.fromEntries(editableFields.map(([key]) => [key, draft[key] ?? '']))
      const saved = await updateCase(draft.id, { ...update, version: draft.version, ...(status ? { status } : {}) })
      setCases(items => items.map(item => item.id === saved.id ? saved : item)); setDraft(saved); setEditing(false)
      setMessage(t('आपके बदलाव सेव हो गए।', 'Your changes have been saved.'))
    } catch (cause) {
      const conflict = cause instanceof Error && cause.message.includes('another session')
      setError(conflict ? t('यह केस दूसरी जगह बदला है। अपने नोट्स कॉपी कर लें, फिर नवीनतम केस लोड करें।', 'This case changed in another session. Copy your notes, then load the latest case.') : t('बदलाव सेव नहीं हुए। फिर कोशिश करें।', 'Your changes could not be saved. Please try again.'))
    } finally { setSaving(false) }
  }
  const exportFhir = async () => {
    if (!draft) return
    try {
      const fhirData = await getFhirBundle(draft.id)
      const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FHIR_Bundle_${draft.token || draft.id}.json`
      a.click()
    } catch {
      setError(t('FHIR डेटा डाउनलोड नहीं हो सका।', 'Failed to export FHIR bundle.'))
    }
  }

  const reloadSelected = async () => { setEditing(false); setError(''); await load() }
  const filtered = cases.filter(item => (filter === 'all' || filter === 'urgent' ? filter !== 'urgent' || item.urgent : item.status === filter) && `${item.patient?.displayName} ${item.token} ${item.chiefComplaint}`.toLowerCase().includes(query.toLowerCase()))
  const statusLabel = (status: CaseDraft['status']) => status === 'approved' ? t('स्वीकृत', 'Approved') : status === 'rejected' ? t('वापस भेजा', 'Rejected') : t('समीक्षा बाकी', 'Awaiting review')

  return <div className="doctor-workspace section-enter"><div className="section-heading"><div><p className="eyebrow">{t('चिकित्सक कार्यस्थल', 'Clinician workspace')}</p><h1>{t('आपके मरीज़, एक जगह', 'Your patients, in one place')}</h1><p>{t('कियोस्क से मिली जानकारी पढ़ें, बदलें और अपना निर्णय सेव करें।', 'Review kiosk submissions, edit clinical details, and save your decision.')}</p></div><button className="secondary-button" disabled={loading} onClick={() => void load()}><RefreshCw size={22}/>{t('रीफ़्रेश', 'Refresh')}</button></div>
    {error && <div className="inline-error" role="alert">{error}{error.includes('session') || error.includes('दूसरी') ? <button className="secondary-button" onClick={reloadSelected}>{t('नवीनतम केस लोड करें', 'Load latest case')}</button> : null}</div>}
    {message && <div className="inline-success" role="status"><CheckCircle/>{message}</div>}
    <div className="queue-toolbar"><span className="queue-count"><span className="live-dot"/>{cases.filter(item => item.status === 'submitted').length} {t('समीक्षा के लिए', 'awaiting review')}</span><label className="search-input"><Search size={22}/><input placeholder={t('नाम, टोकन या परेशानी खोजें', 'Search name, token or concern')} aria-label={t('मरीज़ खोजें', 'Search patients')} value={query} onChange={event => setQuery(event.target.value)}/></label><select aria-label={t('सूची फ़िल्टर', 'Filter queue')} value={filter} onChange={event => setFilter(event.target.value)}><option value="all">{t('सभी केस', 'All cases')}</option><option value="submitted">{t('समीक्षा बाकी', 'Awaiting review')}</option><option value="urgent">{t('प्राथमिकता', 'Priority')}</option><option value="approved">{t('स्वीकृत', 'Approved')}</option><option value="rejected">{t('वापस भेजा', 'Rejected')}</option></select></div>
    {loading ? <div className="loading-state"><LoaderCircle className="animate-spin"/>{t('सूची लोड हो रही है…', 'Loading queue…')}</div> : <div className="doctor-layout"><section className="patient-queue"><h2>{t('मरीज़ों की सूची', 'Patient queue')} <span>{filtered.length}</span></h2>{filtered.length === 0 && <div className="empty-state"><ClipboardCheck size={38}/><h3>{cases.length ? t('कोई मेल नहीं मिला', 'No matching cases') : t('पहले मरीज़ का इंतज़ार', 'Waiting for your first patient')}</h3><p>{t('मरीज़ कियोस्क पर जानकारी भेजेगा तो यहां दिखाई देगी।', 'Visits submitted from the kiosk will appear here.')}</p></div>}{filtered.map(item => <button key={item.id} disabled={editing || saving} onClick={() => select(item.id)} className={`queue-item ${selectedId === item.id ? 'selected' : ''}`}><div><strong className="queue-token">{item.token}</strong><span className={`status-badge ${item.triageLevel === 'red' || item.urgent ? 'urgent' : item.triageLevel === 'yellow' ? 'warning' : item.status}`}>{item.triageLevel === 'red' ? '🔴 RED' : item.triageLevel === 'yellow' ? '🟡 URGENT' : statusLabel(item.status)}</span></div><h3>{item.patient?.displayName ?? item.patientId}</h3><p>{item.chiefComplaint}</p><span className="queue-meta">{item.patient?.age} {t('वर्ष', 'years')} · {item.pathway === 'ayush' ? t('आयुष', 'AYUSH') : t('एलोपैथी', 'Allopathy')}</span></button>)}</section>
      <section className="case-detail">{draft ? <><div className="case-heading"><div><p className="eyebrow">{draft.token} · {statusLabel(draft.status)}</p><h2>{draft.patient?.displayName}</h2><p>{draft.patient?.age} {t('वर्ष', 'years')} · {draft.patient?.opd}</p></div><div style={{ display: 'flex', gap: '0.5rem' }}><button className="secondary-button" onClick={exportFhir}><Download size={18}/> {t('FHIR Export', 'Export FHIR R4')}</button><button className="secondary-button" disabled={saving} onClick={() => { setEditing(current => !current); setDraft(current ?? null); setError('') }}>{editing ? <X size={22}/> : <Pencil size={22}/>} {editing ? t('रद्द करें', 'Cancel') : t('केस बदलें', 'Edit case')}</button></div></div>{draft.urgent && <div className="urgent-banner"><ShieldAlert size={28}/><div><strong>{t('प्राथमिकता समीक्षा', 'Priority review')}</strong><p>{draft.urgentReasons?.join(' ')}</p></div></div>}
        {draft.pathway === 'ayush' && <TridoshaRadar tridosha={draft.tridosha} dashavidha={draft.dashavidha} language={language} />}
        <div className={`clinical-fields ${editing ? 'editing' : ''}`}>{editableFields.map(([key, hindi, english]) => <div className={key === 'hpi' || key === 'clinicianNotes' ? 'full-width' : ''} key={key}><label htmlFor={`case-${key}`}>{t(hindi, english)}</label>{editing ? <textarea id={`case-${key}`} value={draft[key] ?? ''} maxLength={20000} rows={key === 'hpi' ? 7 : 3} onChange={event => setDraft(current => current ? { ...current, [key]: event.target.value } : current)}/> : <p className="clinical-value">{draft[key] || t('जानकारी नहीं दी गई', 'Not provided')}</p>}</div>)}</div>
        <DocumentTimeline key={`docs-${draft.id}`} caseId={draft.id} language={language}/><FollowupPanel key={`followup-${draft.id}`} visit={draft} language={language} onChange={() => void load()}/>
        <div className="case-actions">{editing && <button disabled={saving || !draft.chiefComplaint.trim()} className="secondary-button" onClick={() => void save()}><Save size={21}/>{t('बदलाव सेव करें', 'Save changes')}</button>}<button disabled={saving} className="reject-button" onClick={() => void save('rejected')}><X size={21}/>{t('वापस भेजें', 'Reject case')}</button><button disabled={saving || !draft.chiefComplaint.trim()} className="primary-button" onClick={() => void save('approved')}>{saving ? <LoaderCircle className="animate-spin"/> : <Check size={24}/>} {t('केस स्वीकार करें', 'Approve case')}</button></div>{editing && <p className="field-hint">{t('दूसरा मरीज़ खोलने से पहले बदलाव सेव करें या रद्द करें।', 'Save or cancel your edits before selecting another patient.')}</p>}</> : <div className="empty-state"><ClipboardCheck size={48}/><h2>{t('समीक्षा के लिए केस चुनें', 'Select a case to review')}</h2><p>{t('मरीज़ों की जानकारी और आपके नोट्स यहां दिखाई देंगे।', 'Patient details and your clinical notes will appear here.')}</p></div>}</section></div>}
  </div>
}
function CheckCircle() { return <Check size={23}/> }
