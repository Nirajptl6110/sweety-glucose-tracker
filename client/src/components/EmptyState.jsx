import { Activity } from 'lucide-react';

export default function EmptyState({ title = 'Nothing to show yet', description = 'Your readings will appear here once you add them.' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Activity size={23} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
