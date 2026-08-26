import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Logo from "./Logo";
import {
  listingMegaCategory,
  primaryNav,
  productsMegaMenu,
} from "../../data/mockData";
import styles from "./Header.module.css";

function routeTo(href) {
  if (href.startsWith("/#")) {
    return { pathname: "/", hash: href.slice(1) };
  }
  return href;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const megaTimer = useRef(null);
  const productsActive = location.pathname.startsWith("/products");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMegaOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(megaTimer.current), []);

  const openMega = () => {
    clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    navigate("/products", { state: { q: searchQuery.trim() } });
    setMobileOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link
          to="/"
          className={styles.brand}
          aria-label="PrimeLinor home"
          onClick={() => {
            if (location.pathname === "/") window.scrollTo(0, 0);
          }}
        >
          <Logo />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {primaryNav.map((item) => {
              if (!item.hasMegaMenu) {
                return (
                  <li key={item.id}>
                    <Link className={styles.navLink} to={routeTo(item.href)}>
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={item.id}
                  className={styles.navItemWithMenu}
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  onFocus={openMega}
                  onBlur={closeMega}
                >
                  <Link
                    to="/products"
                    className={`${styles.navLink} ${styles.navButton} ${
                      productsActive ? styles.navLinkActive : ""
                    }`}
                    aria-expanded={megaOpen}
                    aria-controls="products-mega-menu"
                    aria-current={productsActive ? "page" : undefined}
                    onClick={() => setMegaOpen(false)}
                  >
                    {item.label}
                    <Icon
                      name="chevronDown"
                      size={16}
                      className={`${styles.chevron} ${megaOpen ? styles.chevronOpen : ""}`}
                    />
                  </Link>

                  <div
                    id="products-mega-menu"
                    className={`${styles.mega} ${megaOpen ? styles.megaOpen : ""}`}
                    hidden={!megaOpen}
                  >
                    <div className={`container ${styles.megaInner}`}>
                      {productsMegaMenu.map((group) => (
                        <div key={group.id} className={styles.megaGroup}>
                          <p className={styles.megaTitle}>{group.title}</p>
                          <ul className={styles.megaList}>
                            {group.items.map((entry) => (
                              <li key={entry}>
                                <Link
                                  className={styles.megaLink}
                                  to="/products"
                                  state={
                                    listingMegaCategory[entry]
                                      ? { category: listingMegaCategory[entry] }
                                      : undefined
                                  }
                                  onClick={() => setMegaOpen(false)}
                                >
                                  {entry}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <div className={styles.megaFeature}>
                        <p className={styles.megaFeatureTitle}>
                          Not sure where to start?
                        </p>
                        <p className={styles.megaFeatureText}>
                          Preview your logo on popular products before you
                          decide.
                        </p>
                        <Button
                          as={Link}
                          to="/products"
                          variant="accent"
                          size="sm"
                          trailingIcon="arrowRight"
                          onClick={() => setMegaOpen(false)}
                        >
                          Try Your Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <form
            className={styles.search}
            role="search"
            onSubmit={submitSearch}
          >
            <label className="visually-hidden" htmlFor="header-search">
              Search products
            </label>
            <Icon name="search" size={18} className={styles.searchIcon} />
            <input
              id="header-search"
              className={styles.searchInput}
              type="search"
              placeholder="Search products"
              autoComplete="off"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </form>

          <Button
            as={Link}
            to={{ pathname: "/", hash: "#request-quote" }}
            variant="primary"
            size="md"
            className={styles.headerCta}
          >
            <span className={styles.ctaLong}>Request a Quote</span>
            <span className={styles.ctaShort}>Get Quote</span>
          </Button>

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Icon name={mobileOpen ? "close" : "menu"} size={22} />
            <span className="visually-hidden">
              {mobileOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={styles.mobilePanel}
        hidden={!mobileOpen}
      >
        <div className={`container ${styles.mobileInner}`}>
          <ul className={styles.mobileList}>
            {primaryNav.map((item) => (
              <li key={item.id}>
                <Link
                  className={`${styles.mobileLink} ${
                    item.id === "products" && productsActive
                      ? styles.mobileLinkActive
                      : ""
                  }`}
                  to={routeTo(item.href)}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            as={Link}
            to={{ pathname: "/", hash: "#request-quote" }}
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setMobileOpen(false)}
          >
            Request a Quote
          </Button>
        </div>
      </div>
    </header>
  );
}
