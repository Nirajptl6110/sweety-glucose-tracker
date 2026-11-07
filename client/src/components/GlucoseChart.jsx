import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SLOT_LABELS, SLOT_ORDER } from '../utils/dates';

export default function GlucoseChart({ readings = [] }) {
  const data = [...readings]
    .sort((a, b) => SLOT_ORDER.indexOf(a.time_slot) - SLOT_ORDER.indexOf(b.time_slot))
    .map((reading) => ({ ...reading, label: SLOT_LABELS[reading.time_slot] || reading.time_slot }));

  if (!data.length) return null;

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 12, right: 16, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#eeeaf5" strokeDasharray="4 5" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#88869a', fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#88869a', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ border: '1px solid #eeeaf5', borderRadius: 12, boxShadow: '0 10px 30px #27204412' }}
            formatter={(value) => [`${value} mg/dL`, 'Glucose']}
          />
          <Line type="monotone" dataKey="value" stroke="#7765c8" strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: '#7765c8', strokeWidth: 3 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
