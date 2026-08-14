import { Link, Outlet } from 'react-router-dom';
import { NavMenu } from './NavMenu';

// Application shell: header with the logo centered, a burger menu (mobile) /
// top tab bar (landscape) nav, plus the routed page outlet.
export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <NavMenu />
        <Link to="/" className="app-title">
          rezeptbuch
        </Link>
        <Link to="/recipes/new" className="button button-primary">
          + New recipe
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
