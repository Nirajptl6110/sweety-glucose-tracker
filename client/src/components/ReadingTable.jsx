import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';
import { formatDate, SLOT_LABELS } from '../utils/dates';

export default function ReadingTable({ readings = [], onDelete, deletingId, compact = false }) {
  if (!readings.length) {
    return <EmptyState title="No readings found" description="Try another date or add your first reading." />;
  }

  return (
    <div className="table-scroll">
      <table className="reading-table">
        <thead>
          <tr><th>Date</th><th>Time</th><th>Glucose</th>{!compact && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{formatDate(reading.reading_date, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              <td><span className="slot-pill">{SLOT_LABELS[reading.time_slot] || reading.time_slot}</span></td>
              <td><strong className="reading-number">{reading.value}</strong><span className="table-unit"> mg/dL</span></td>
              {!compact && (
                <td>
                  <div className="table-actions">
                    <Link className="icon-button" to={`/readings/${reading.id}/edit`} aria-label="Edit reading"><Pencil size={16} /></Link>
                    <button className="icon-button danger-icon" type="button" onClick={() => onDelete(reading)} disabled={deletingId === reading.id} aria-label="Delete reading"><Trash2 size={16} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
