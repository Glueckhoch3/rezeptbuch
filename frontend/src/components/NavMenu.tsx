import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-link nav-link-active' : 'nav-link';
}

const links = [
  { to: '/', label: 'Recipes', end: true },
  { to: '/ingredients', label: 'Ingredients', end: false },
  { to: '/tags', label: 'Tags', end: false },
  { to: '/allergens', label: 'Allergens', end: false },
];

// Burger button + link list on narrow screens (dropdown, toggled via local
// state); a CSS media query at --bp-md (768px, kept in sync with
// variables.css) forces the same link list into an always-visible top tab
// row and hides the burger button on landscape/wide screens, so no JS is
// needed for that breakpoint switch.
export function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="app-nav-menu"
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>
      <nav
        id="app-nav-menu"
        className={open ? 'app-nav app-nav-open' : 'app-nav'}
      >
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
