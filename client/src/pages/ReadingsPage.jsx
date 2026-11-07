import { useEffect, useState } from 'react';
import { CalendarDays, Plus, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ReadingTable from '../components/ReadingTable';
import api, { getErrorMessage } from '../services/api';
import { localDateString, SLOT_LABELS, SLOT_ORDER } from '../utils/dates';

export default function ReadingsPage() {
  const location = useLocation();
  const [filters, setFilters] = useState({ reading_date: '', time_slot: '' });
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [notice, setNotice] = useState(location.state?.message || '');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = {};
    if (filters.reading_date) params.reading_date = filters.reading_date;
    if (filters.time_slot) params.time_slot = filters.time_slot;
    api.get('/readings', { params })
      .then(({ data }) => { if (active) setReadings(data.data.readings); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'Could not load your readings.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);

  async function deleteReading(reading) {
    if (!window.confirm(`Delete your ${SLOT_LABELS[reading.time_slot]} reading of ${reading.value} mg/dL? This cannot be undone.`)) return;
    setDeletingId(reading.id);
    setError('');
    try {
      await api.delete(`/readings/${reading.id}`);
      setReadings((current) => current.filter((item) => item.id !== reading.id));
      setNotice('Reading deleted successfully.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not delete this reading.'));
    } finally {
      setDeletingId('');
    }
  }

  function clearFilters() {
    setFilters({ reading_date: '', time_slot: '' });
  }

  return (
    <div className="page-content">
      {notice && <div className="alert alert-success dismissible" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="panel history-panel">
        <div className="panel-heading history-heading"><div><h3>Your readings</h3><p>Only you can see the readings in your account.</p></div><Link to="/readings/new" className="button button-primary"><Plus size={17} /> Add reading</Link></div>
        <div className="filter-row"><span className="filter-label"><SlidersHorizontal size={16} /> Filter by</span><label className="filter-control"><CalendarDays size={16} /><input type="date" max={localDateString()} value={filters.reading_date} onChange={(e) => setFilters({ ...filters, reading_date: e.target.value })} aria-label="Filter by date" /></label><select className="filter-select" value={filters.time_slot} onChange={(e) => setFilters({ ...filters, time_slot: e.target.value })} aria-label="Filter by time slot"><option value="">All time slots</option>{SLOT_ORDER.map((slot) => <option key={slot} value={slot}>{SLOT_LABELS[slot]}</option>)}</select>{(filters.reading_date || filters.time_slot) && <button type="button" className="text-link clear-filters" onClick={clearFilters}>Clear filters</button>}</div>
        {loading ? <Loading label="Loading your readings…" /> : readings.length ? <ReadingTable readings={readings} onDelete={deleteReading} deletingId={deletingId} /> : <EmptyState title="No readings match these filters" description="Try clearing a filter, or add a new reading." />}
      </section>
    </div>
  );
}
