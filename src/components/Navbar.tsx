"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Search, MapPin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import type { City } from "@/lib/types";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/cities/search?q=${encodeURIComponent(searchQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSearchResults(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/salary-calculator", label: "Salary Calculator" },
    { href: "/cheapest-cities", label: "Cheapest Cities" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg leading-none">CostWise</span>
                <span className="text-xs text-muted-foreground block leading-none">
                  USA Cost of Living
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2" ref={searchRef}>
            {showSearch ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-56"
                />
                {searchResults.length > 0 && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-md shadow-lg z-50 overflow-hidden">
                    {searchResults.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/cost-of-living/${city.slug}`}
                      >
                        <div
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery("");
                          }}
                        >
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">
                              {city.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {city.state}
                            </div>
                          </div>
                          <div className="ml-auto text-xs text-muted-foreground">
                            Index: {city.costIndex.toFixed(0)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
