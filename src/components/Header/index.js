"use client";
import Link from "next/link";
import Logo from "./Logo";
import { GithubIcon, InstagramIcon, LinkedinIcon, MoonIcon, SunIcon } from "../Icons";
import siteMetadata from "@/src/utils/siteMetaData";
import { useThemeSwitch } from "../Hooks/useThemeSwitch";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/src/utils";

const aboutLinks = [
  { href: "/about", label: "about VISI" },
  { href: "/members", label: "members" },
  { href: "/partners", label: "partners" },
  { href: "/our-work", label: "our work" },
  { href: "/resources", label: "resources" },
];

const ChevronIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cx("w-3 h-3 ml-1 inline-block", className)}
  >
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AboutMenu = () => {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapper}
      className="relative mx-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!wrapper.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {/* The label is a link to the about page; the submenu opens on hover or focus,
          so clicking it navigates instead of fighting the hover state. */}
      <Link
        href="/about"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center capitalize"
      >
        about
        <ChevronIcon className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </Link>

      <div
        className={cx(
          "absolute left-1/2 -translate-x-1/2 top-full pt-3 w-48 transition-all ease duration-200",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <ul className="flex flex-col rounded-2xl border border-solid border-dark bg-light/95 backdrop-blur-sm py-2 shadow-lg">
          {aboutLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-5 py-2 capitalize hover:bg-dark/5"
                tabIndex={open ? 0 : -1}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Header = () => {
  const [mode, setMode] = useThemeSwitch();
  const [click, setClick] = useState(false);

  const toggle = () => {
    setClick(!click);
  };

  const themeButton = (
    <button
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      className={cx(
        "w-6 h-6 ease ml-2 flex items-center justify-center rounded-full p-1",
        mode === "light" ? "bg-dark text-light" : "bg-light text-dark"
      )}
      aria-label="theme-switcher"
    >
      {mode === "light" ? <MoonIcon className={"fill-dark"} /> : <SunIcon className={"fill-dark"} />}
    </button>
  );

  return (
    <header className="w-full p-4  px-5 sm:px-10 flex items-center justify-between">
      <Logo />

      <button className="inline-block sm:hidden z-50 py-3 -my-3" onClick={toggle} aria-label="Hamburger Menu">
        <div className="w-6 cursor-pointer transition-all ease duration-300">
          <div className="relative h-0.5">
            <span
              className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
              style={{
                transform: click ? "rotate(-45deg) translateY(0)" : "rotate(0deg) translateY(6px)",
              }}
            >
              &nbsp;
            </span>
            <span
              className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
              style={{
                opacity: click ? 0 : 1,
              }}
            >
              &nbsp;
            </span>
            <span
              className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
              style={{
                transform: click ? "rotate(45deg) translateY(0)" : "rotate(0deg) translateY(-6px)",
              }}
            >
              &nbsp;
            </span>
          </div>
        </div>
      </button>

      {/* Mobile menu */}
      <nav
        className="w-56 py-4 px-6 border border-solid border-dark rounded-3xl font-medium capitalize flex flex-col items-start sm:hidden
        fixed top-6 right-1/2 translate-x-1/2 bg-light/90 backdrop-blur-sm z-50
        transition-all ease duration-300 gap-1
        "
        style={{
          top: click ? "1rem" : "-40rem",
        }}
      >
        <Link href="/" className="py-1" onClick={toggle}>
          Home
        </Link>
        {aboutLinks.map((link) => (
          <Link key={link.href} href={link.href} className="py-1" onClick={toggle}>
            {link.label}
          </Link>
        ))}
        <Link href="/events" className="py-1" onClick={toggle}>
          Events
        </Link>
        <Link href="/categories/all" className="py-1" onClick={toggle}>
          Blog
        </Link>
        <Link href="/contact" className="py-1" onClick={toggle}>
          Contact
        </Link>
        <div className="flex items-center mt-2 -ml-2">{themeButton}</div>
      </nav>

      {/* Desktop menu */}
      <nav
        className=" w-max py-3 px-8 border border-solid border-dark rounded-full font-medium capitalize  items-center hidden sm:flex
        fixed top-6 right-1/2 translate-x-1/2 bg-light/80 backdrop-blur-sm z-50"
      >
        <Link href="/" className="mr-2">
          Home
        </Link>
        <AboutMenu />
        <Link href="/events" className="mx-2">
          Events
        </Link>
        <Link href="/categories/all" className="mx-2">
          Blog
        </Link>
        <Link href="/contact" className="mx-2">
          Contact
        </Link>
        {themeButton}
      </nav>

      <div className=" hidden sm:flex items-center">
        <a
          href={siteMetadata.linkedin}
          rel="noopener noreferrer"
          className="inline-block w-6 h-6 mr-4"
          aria-label="VISI on LinkedIn"
          target="_blank"
        >
          <LinkedinIcon className="hover:scale-125 transition-all ease duration-200" />
        </a>
        <a
          href={siteMetadata.instagram}
          rel="noopener noreferrer"
          className="inline-block w-6 h-6 mr-4"
          aria-label="VISI on Instagram"
          target="_blank"
        >
          <InstagramIcon className="hover:scale-125 transition-all ease duration-200 dark:fill-light" />
        </a>
        <a
          href={siteMetadata.github}
          rel="noopener noreferrer"
          className="inline-block w-6 h-6 mr-4"
          aria-label="VISI on GitHub"
          target="_blank"
        >
          <GithubIcon className="  hover:scale-125 transition-all ease duration-200 dark:fill-light" />
        </a>
      </div>
    </header>
  );
};

export default Header;
