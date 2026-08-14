import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NavMenu } from './NavMenu';

describe('NavMenu', () => {
  it('toggles the link list open and closed via the burger button', async () => {
    render(
      <MemoryRouter>
        <NavMenu />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', {
      name: 'Toggle navigation menu',
    });
    const nav = screen.getByRole('navigation');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(nav).not.toHaveClass('app-nav-open');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(nav).toHaveClass('app-nav-open');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(nav).not.toHaveClass('app-nav-open');
  });

  it('closes the menu after a link is clicked', async () => {
    render(
      <MemoryRouter>
        <NavMenu />
      </MemoryRouter>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Toggle navigation menu' }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'Tags' }));

    expect(
      screen.getByRole('button', { name: 'Toggle navigation menu' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
