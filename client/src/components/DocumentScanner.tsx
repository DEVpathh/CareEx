import React, { useState } from 'react'
import { FileText, Upload, CheckCircle2, AlertCircle, Trash2, Sparkles } from 'lucide-react'
import type { UploadedDocument } from '../types/clinical'
import { scanDocument } from '../services/patientService'

interface DocumentScannerProps {
  language: string
  documents: UploadedDocument[]
  onAddDocument: (doc: UploadedDocument) => void
  onRemoveDocument: (docId: string) => void
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  language,
  documents,
  onAddDocument,
  onRemoveDocument,
}) => {
  const [scanning, setScanning] = useState(false)
  const hi = language !== 'English'

  const simulateScan = async (fileType: 'prescription' | 'lab_report') => {
    setScanning(true)
    try {
      const fileName = fileType === 'prescription' ? 'Recent_Prescription.pdf' : 'Lab_Report_CBC_KFT.pdf'
      const doc = await scanDocument(fileName, fileType)
      onAddDocument(doc as UploadedDocument)
    } catch (err) {
      console.error(err)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="card-container" style={{ padding: '1.25rem', marginTop: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ color: '#0284c7' }} size={22} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            {hi ? 'पुराने पर्चे या लैब रिपोर्ट स्कैन करें (Module B)' : 'Scan Prior Prescriptions or Lab Reports'}
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
          AI OCR Active
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
        {hi
          ? 'यदि आपके पास पुरानी डॉक्टर की पर्ची या लैब रिपोर्ट की फोटो/PDF है, तो यहाँ स्कैन करें।'
          : 'Upload your prior prescription or lab test report. The AI engine will extract meds and flag out-of-range values.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          type="button"
          disabled={scanning}
          onClick={() => simulateScan('prescription')}
          className="secondary-button"
          style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <Upload size={18} />
          <span>{scanning ? (hi ? 'स्कैन हो रहा है...' : 'Scanning...') : hi ? '+ पर्चा स्कैन करें' : '+ Scan Prescription'}</span>
        </button>

        <button
          type="button"
          disabled={scanning}
          onClick={() => simulateScan('lab_report')}
          className="secondary-button"
          style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <Sparkles size={18} style={{ color: '#d97706' }} />
          <span>{scanning ? (hi ? 'स्कैन हो रहा है...' : 'Scanning...') : hi ? '+ लैब रिपोर्ट अपलोड करें' : '+ Upload Lab Report'}</span>
        </button>
      </div>

      {documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', color: '#334155' }}>
            {hi ? 'स्कैन किए गए दस्तावेज़:' : 'Scanned Documents:'}
          </h4>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: '#ffffff',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                  <span>{doc.fileName}</span>
                  {doc.hasAbnormalValues && (
                    <span style={{ fontSize: '0.7rem', background: '#fef2f2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <AlertCircle size={12} /> {hi ? 'असामान्य परिणाम' : 'Abnormal Values'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {doc.extractedMedicines && doc.extractedMedicines.length > 0 && (
                    <span>Meds: {doc.extractedMedicines.join(', ')}</span>
                  )}
                  {doc.extractedLabs && doc.extractedLabs.length > 0 && (
                    <span>Labs: {doc.extractedLabs.map((l) => `${l.testName} (${l.value} ${l.unit})`).join(', ')}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveDocument(doc.id)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                aria-label="Remove document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
