import { Suspense, lazy, useEffect, useState } from 'react';
import { Activity, ArrowRight, CalendarDays, Droplets, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ReadingTable from '../components/ReadingTable';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { formatDate, localDateString } from '../utils/dates';

const GlucoseChart = lazy(() => import('../components/GlucoseChart'));

export default function DashboardPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(localDateString());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/reports/daily', { params: { date } })
      .then(({ data }) => { if (active) setReport(data.data); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'Could not load your daily report.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date]);

  const hasReadings = report?.count > 0;

  return (
    <div className="page-content">
      <section className="welcome-banner">
        <div className="welcome-copy"><span className="welcome-kicker"><span className="status-dot" /> YOUR HEALTH, AT A GLANCE</span><h2>Good to see you, {user?.name?.split(' ')[0] || 'friend'} <span>☺</span></h2><p>Every check-in is a step toward knowing yourself better.</p></div>
        <div className="welcome-art"><div className="welcome-circle circle-back" /><div className="welcome-circle circle-front"><Droplets size={35} /></div><span className="welcome-sparkle sparkle-a">✦</span><span className="welcome-sparkle sparkle-b">✧</span></div>
      </section>

      <div className="section-heading summary-heading"><div><span className="eyebrow">YOUR DAILY SNAPSHOT</span><h2>Today’s overview</h2></div><label className="date-control"><CalendarDays size={17} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Report date" /></label></div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Loading label="Gathering your readings…" /> : (
        <>
          <div className="stats-grid">
            <StatCard label="Highest" value={hasReadings ? report.highest : null} icon={TrendingUp} tone="peach" hint="Today’s peak" />
            <StatCard label="Lowest" value={hasReadings ? report.lowest : null} icon={TrendingDown} tone="mint" hint="Today’s low" />
            <StatCard label="Average" value={hasReadings ? report.average : null} icon={Activity} tone="lavender" hint="Daily average" />
            <StatCard label="Readings" value={report?.count ?? 0} unit="total" icon={Droplets} tone="blue" hint="Check-ins today" />
          </div>

          <div className="dashboard-grid">
            <section className="panel chart-panel">
              <div className="panel-heading"><div><h3>Glucose throughout the day</h3><p>{formatDate(date)}</p></div><span className="panel-icon"><Activity size={18} /></span></div>
              {hasReadings ? <Suspense fallback={<Loading label="Preparing your chart…" />}><GlucoseChart readings={report.readings} /></Suspense> : <EmptyState title="Your chart will grow with you" description="Add a reading to see your glucose pattern for the day." />}
            </section>
            <section className="panel quick-panel">
              <div className="panel-heading"><div><h3>A little check-in?</h3><p>Keep your daily picture up to date.</p></div><span className="panel-icon"><Plus size={18} /></span></div>
              <div className="quick-callout"><span className="quick-illustration"><Droplets size={24} /></span><div><strong>Log how you’re doing</strong><p>It only takes a moment to add a glucose reading.</p></div></div>
              <Link to="/readings/new" className="button button-primary button-wide">Add a reading <ArrowRight size={17} /></Link>
              <Link className="text-link quick-history" to="/readings">View your reading history <ArrowRight size={15} /></Link>
            </section>
          </div>

          <section className="panel recent-panel">
            <div className="panel-heading"><div><h3>Today’s readings</h3><p>{hasReadings ? `${report.count} ${report.count === 1 ? 'check-in' : 'check-ins'} for ${formatDate(date, { month: 'long', day: 'numeric' })}` : 'Your daily check-ins will show up here.'}</p></div><Link className="text-link" to="/readings">All readings <ArrowRight size={15} /></Link></div>
            {hasReadings ? <ReadingTable readings={report.readings.map((reading, index) => ({ ...reading, id: `${date}-${reading.time_slot}-${index}` }))} compact /> : <EmptyState title="No readings for this day" description="That’s okay. Add a check-in whenever you’re ready." />}
          </section>
        </>
      )}
    </div>
  );
}
