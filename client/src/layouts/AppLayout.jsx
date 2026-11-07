import { Activity, CalendarDays, ChartNoAxesCombined, LogOut, Plus, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': ['Your overview', 'A little progress, every day.'],
  '/readings': ['Reading history', 'Your glucose story, all in one place.'],
  '/reports': ['Reports & trends', 'See the bigger picture, one day at a time.'],
  '/readings/new': ['Add a reading', 'A small check-in is a big act of care.'],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || (location.pathname.endsWith('/edit')
    ? ['Edit reading', 'Update the details for this check-in.']
    : ['Your overview', 'A little progress, every day.']);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-caption">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Activity size={18} />Overview</NavLink>
          <NavLink to="/readings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><CalendarDays size={18} />Reading history</NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><ChartNoAxesCombined size={18} />Reports & trends</NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="note-icon"><Sparkles size={17} /></span>
          <strong>One day at a time</strong>
          <p>Every reading helps you understand your health a little better.</p>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</span>
          <div className="user-meta"><strong>{user?.name || 'Sweety member'}</strong><span>{user?.email || 'Your account'}</span></div>
          <button className="logout-button" type="button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><h1>{title[0]}</h1><p>{title[1]}</p></div>
          <NavLink className="button button-primary top-add" to="/readings/new"><Plus size={17} /> Add reading</NavLink>
        </header>
        <div className="mobile-brand"><Brand compact /><button type="button" className="logout-button" onClick={logout} aria-label="Sign out"><LogOut size={17} /></button></div>
        <Outlet />
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavLink to="/" end><Activity size={18} /><span>Home</span></NavLink>
        <NavLink to="/readings"><CalendarDays size={18} /><span>Readings</span></NavLink>
        <NavLink to="/reports"><ChartNoAxesCombined size={18} /><span>Reports</span></NavLink>
        <NavLink to="/readings/new"><Plus size={18} /><span>Add</span></NavLink>
      </nav>
    </div>
  );
}
