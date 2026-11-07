import { Droplets } from 'lucide-react';

export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark"><Droplets size={20} strokeWidth={2.5} /></span>
      <span className="brand-name">sweety<span>.</span></span>
    </div>
  );
}
