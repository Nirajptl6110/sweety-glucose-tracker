import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Droplets } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import api, { getErrorMessage } from '../services/api';
import { localDateString, SLOT_LABELS, SLOT_ORDER } from '../utils/dates';

export default function ReadingFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ reading_date: localDateString(), time_slot: 'morning', value: '' });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    api.get(`/readings/${id}`)
      .then(({ data }) => {
        const reading = data.data.reading;
        setForm({ reading_date: reading.reading_date, time_slot: reading.time_slot, value: String(reading.value) });
      })
      .catch((requestError) => setError(getErrorMessage(requestError, 'Could not load this reading.')))
      .finally(() => setLoading(false));
  }, [editing, id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const value = Number(form.value);
    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setError('Enter a whole number from 40 to 600 mg/dL.');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, value };
      if (editing) await api.put(`/readings/${id}`, body);
      else await api.post('/readings', body);
      navigate('/readings', { replace: true, state: { message: editing ? 'Reading updated successfully.' : 'Reading added successfully.' } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save this reading.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading label="Loading reading…" />;

  return (
    <div className="page-content narrow-content">
      <Link to={editing ? '/readings' : '/'} className="back-link"><ArrowLeft size={16} /> Back</Link>
      <section className="panel form-panel">
        <div className="form-intro"><span className="form-icon"><Droplets size={21} /></span><div><h2>{editing ? 'Update your reading' : 'Add a glucose reading'}</h2><p>Choose the date, time and value for this check-in.</p></div></div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="form-stack reading-form">
          <label className="field"><span>Reading date</span><input type="date" value={form.reading_date} max={localDateString()} onChange={(e) => setForm({ ...form, reading_date: e.target.value })} required /></label>
          <fieldset className="slot-fieldset"><legend>When did you take it?</legend><div className="slot-options">{SLOT_ORDER.map((slot) => <button key={slot} type="button" className={`slot-option ${form.time_slot === slot ? 'selected' : ''}`} onClick={() => setForm({ ...form, time_slot: slot })}>{SLOT_LABELS[slot]}</button>)}</div></fieldset>
          <label className="field"><span>Glucose value <small>mg/dL</small></span><input type="number" min="40" max="600" step="1" inputMode="numeric" placeholder="e.g. 105" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required /><small className="field-hint">Enter a whole number from 40 to 600.</small></label>
          <div className="form-actions"><Link className="button button-quiet" to="/readings">Cancel</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : <><Check size={17} /> {editing ? 'Save changes' : 'Save reading'}</>}</button></div>
        </form>
      </section>
    </div>
  );
}
