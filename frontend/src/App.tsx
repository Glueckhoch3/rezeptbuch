import { Link, Outlet } from 'react-router-dom';

// Application shell: header with navigation plus the routed page outlet.
export function App() {
  return (
    <div className="app">
      <header className="app-header">
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
