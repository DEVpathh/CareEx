import React from 'react'
import { Leaf, Flame, Wind, Droplets, Compass } from 'lucide-react'
import type { TridoshaScore, DashavidhaMatrix } from '../types/clinical'

interface TridoshaRadarProps {
  tridosha?: TridoshaScore
  dashavidha?: DashavidhaMatrix
  language?: string
}

export const TridoshaRadar: React.FC<TridoshaRadarProps> = ({ tridosha, dashavidha, language }) => {
  if (!tridosha) return null
  const hi = language !== 'English'

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Leaf style={{ color: '#059669' }} size={22} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#064e3b' }}>
            {hi ? 'आयुष त्रिदोष एवं दशविध परीक्षा' : 'AYUSH Tridosha & Dashavidha Matrix'}
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', background: '#059669', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
          {tridosha.dominant} {hi ? 'प्रबल' : 'Dominant'}
        </span>
      </div>

      {/* Tridosha Bar Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Vata */}
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#0284c7', fontWeight: 600 }}>
            <Wind size={16} /> <span>वात (Vata)</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0369a1', margin: '0.2rem 0' }}>{tridosha.vata}%</div>
          <div style={{ height: '6px', background: '#e0f2fe', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${tridosha.vata}%`, height: '100%', background: '#0284c7' }} />
          </div>
        </div>

        {/* Pitta */}
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#ea580c', fontWeight: 600 }}>
            <Flame size={16} /> <span>पित्त (Pitta)</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c2410c', margin: '0.2rem 0' }}>{tridosha.pitta}%</div>
          <div style={{ height: '6px', background: '#ffedd5', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${tridosha.pitta}%`, height: '100%', background: '#ea580c' }} />
          </div>
        </div>

        {/* Kapha */}
        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 600 }}>
            <Droplets size={16} /> <span>कफ (Kapha)</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803d', margin: '0.2rem 0' }}>{tridosha.kapha}%</div>
          <div style={{ height: '6px', background: '#dcfce7', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${tridosha.kapha}%`, height: '100%', background: '#16a34a' }} />
          </div>
        </div>
      </div>

      {/* Dashavidha Assessment Matrix Grid */}
      {dashavidha && (
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#047857' }}>
            <Compass size={16} /> <span>{hi ? 'दशविध परीक्षा विवरण (AIIA Clinical Spec)' : 'Dashavidha Pariksha Matrix (AIIA Spec)'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.8rem', color: '#334155' }}>
            <div><strong>Prakriti:</strong> {dashavidha.prakriti}</div>
            <div><strong>Vikriti:</strong> {dashavidha.vikriti}</div>
            <div><strong>Agni:</strong> {dashavidha.agni}</div>
            <div><strong>Koshtha:</strong> {dashavidha.koshtha}</div>
            <div><strong>Ahara Shakti:</strong> {dashavidha.aharaShakti}</div>
            <div><strong>Vyayama Shakti:</strong> {dashavidha.vyayamaShakti}</div>
          </div>
        </div>
      )}
    </div>
  )
}
