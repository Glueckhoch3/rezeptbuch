import { Link, NavLink, Outlet } from 'react-router-dom';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-link nav-link-active' : 'nav-link';
}

// Application shell: header with top nav plus the routed page outlet.
export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          rezeptbuch
        </Link>
        <nav className="app-nav">
          <NavLink to="/" end className={navLinkClass}>
            Recipes
          </NavLink>
          <NavLink to="/ingredients" className={navLinkClass}>
            Ingredients
          </NavLink>
          <NavLink to="/tags" className={navLinkClass}>
            Tags
          </NavLink>
          <NavLink to="/allergens" className={navLinkClass}>
            Allergens
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Search
          </NavLink>
        </nav>
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
