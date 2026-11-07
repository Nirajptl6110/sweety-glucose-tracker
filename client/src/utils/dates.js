export function localDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function formatDate(dateString, options = { month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en', options).format(new Date(`${dateString}T12:00:00`));
}

export const SLOT_LABELS = {
  morning: 'Morning',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

export const SLOT_ORDER = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];
