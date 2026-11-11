import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from './Container.jsx';
import Logo from './Logo.jsx';
import { navLinks } from '../data/content.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-line bg-bg/88 backdrop-blur-md">
      <Container as="nav" className="flex h-[76px] items-center justify-between">
        <Logo />

        <ul
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-[76px] flex-col border-b border-line bg-elevated py-2
            lg:static lg:flex lg:flex-row lg:items-center lg:gap-[34px] lg:border-0 lg:bg-transparent lg:p-0`}
        >
          {navLinks.map((link) => (
            <li key={link.href} className="border-t border-line first:border-t-0 lg:border-0">
              <a
                href={link.href}
                onClick={close}
                className="block px-8 py-4 text-[0.95rem] text-ink-muted no-underline transition-colors hover:text-ink lg:p-0"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="border-t border-line lg:border-0">
            <Link
              to="/login"
              onClick={close}
              className="mx-8 my-3.5 block rounded   px-5 py-2.5 text-center text-[0.95rem] font-semibold text-ink no-underline hover:border-ink-faint lg:m-0 lg:inline-block"
            >
              Sign in
            </Link>
          </li>
          <li className="border-t border-line lg:border-0">
            <a
              href="/register"
              // onClick={close}
              className="mx-8 my-3.5 block rounded bg-accent px-5 py-2.5 text-center text-[0.95rem] font-semibold text-accent-ink no-underline hover:opacity-[0.92] lg:m-0 lg:inline-block"
            >
              Get Started
            </a>
          </li>
        </ul>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="h-[42px] w-[42px] cursor-pointer rounded-md border border-line text-lg text-ink lg:hidden"
        >
          ☰
        </button>
      </Container>
    </header>
  );
}
