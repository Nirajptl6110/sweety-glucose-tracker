import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Droplets, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ReadingTable from '../components/ReadingTable';
import StatCard from '../components/StatCard';
import api, { getErrorMessage } from '../services/api';
import { formatDate, localDateString } from '../utils/dates';

const REPORTS = [
  { id: 'daily', label: 'Daily', path: '/reports/daily' },
  { id: 'month-to-date', label: 'Month to date', path: '/reports/month-to-date' },
  { id: 'previous-month', label: 'Previous month', path: '/reports/previous-month' },
];

export default function ReportsPage() {
  const [type, setType] = useState('daily');
  const [date, setDate] = useState(localDateString());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const route = REPORTS.find((item) => item.id === type);
    setLoading(true);
    setError('');
    api.get(route.path, { params: { date } })
      .then(({ data }) => { if (active) setReport(data.data); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'Could not load this report.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, date]);

  const hasReadings = report?.count > 0;
  const isDaily = type === 'daily';
  const chartData = hasReadings ? [
    { label: 'Lowest', value: report.lowest, fill: '#91cdb8' },
    { label: 'Average', value: report.average, fill: '#8d7bd4' },
    { label: 'Highest', value: report.highest, fill: '#edaa91' },
  ] : [];
  const periodLabel = isDaily
    ? formatDate(report?.date || date)
    : `${formatDate(report?.period_start)} – ${formatDate(report?.period_end)}`;

  return (
    <div className="page-content">
      <section className="report-hero"><div><span className="eyebrow">UNDERSTAND YOUR PATTERNS</span><h2>A clearer view of your progress.</h2><p>Choose a time range to explore your glucose readings and patterns.</p></div><span className="report-hero-icon"><Activity size={29} /></span></section>
      <div className="report-toolbar"><div className="report-tabs" role="tablist" aria-label="Report type">{REPORTS.map((item) => <button key={item.id} role="tab" aria-selected={type === item.id} className={type === item.id ? 'selected' : ''} onClick={() => setType(item.id)}>{item.label}</button>)}</div><label className="date-control"><CalendarDays size={17} /><input type="date" max={localDateString()} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Report date" /></label></div>
      <div className="report-period-label"><span>{type === 'daily' ? 'REPORT FOR' : 'REPORT PERIOD'}</span><strong>{periodLabel}</strong></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? <Loading label="Preparing your report…" /> : report && (
        <>
          <div className="stats-grid">
            <StatCard label="Highest" value={hasReadings ? report.highest : null} icon={TrendingUp} tone="peach" hint="Peak reading" />
            <StatCard label="Lowest" value={hasReadings ? report.lowest : null} icon={TrendingDown} tone="mint" hint="Lowest reading" />
            <StatCard label="Average" value={hasReadings ? report.average : null} icon={Activity} tone="lavender" hint="Average glucose" />
            <StatCard label="Readings" value={report.count} unit="total" icon={Droplets} tone="blue" hint="In this period" />
          </div>
          <section className="panel report-chart-panel">
            <div className="panel-heading"><div><h3>{isDaily ? 'Readings by time of day' : 'Glucose range summary'}</h3><p>{isDaily ? 'Your check-ins in chronological order.' : 'Compare your high, average and low readings.'}</p></div><span className="panel-icon"><Activity size={18} /></span></div>
            {!hasReadings ? <EmptyState title="No readings in this period" description="There’s no data to chart yet. Your report will update as you log readings." /> : isDaily ? <div className="reports-reading-table"><ReadingTable readings={report.readings.map((reading, index) => ({ ...reading, id: `${reading.reading_date}-${reading.time_slot}-${index}` }))} compact /></div> : (
              <div className="chart-wrap report-bar-chart"><ResponsiveContainer width="100%" height={270}><BarChart data={chartData} margin={{ top: 12, right: 16, left: -15, bottom: 0 }}><CartesianGrid stroke="#eeeaf5" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#88869a', fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#88869a', fontSize: 11 }} /><Tooltip formatter={(value) => [`${value} mg/dL`, 'Glucose']} contentStyle={{ border: '1px solid #eeeaf5', borderRadius: 12 }} /><Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={58}>{chartData.map((item) => <Cell key={item.label} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
