import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const topCityLinks = [
  { slug: "new-york-ny", name: "New York" },
  { slug: "los-angeles-ca", name: "Los Angeles" },
  { slug: "chicago-il", name: "Chicago" },
  { slug: "san-francisco-ca", name: "San Francisco" },
  { slug: "seattle-wa", name: "Seattle" },
  { slug: "austin-tx", name: "Austin" },
  { slug: "denver-co", name: "Denver" },
  { slug: "miami-fl", name: "Miami" },
];

const compareLinks = [
  { slugA: "austin-tx", slugB: "dallas-tx", label: "Austin vs Dallas" },
  { slugA: "new-york-ny", slugB: "los-angeles-ca", label: "New York vs LA" },
  { slugA: "seattle-wa", slugB: "san-francisco-ca", label: "Seattle vs SF" },
  { slugA: "denver-co", slugB: "austin-tx", label: "Denver vs Austin" },
  { slugA: "miami-fl", slugB: "nashville-tn", label: "Miami vs Nashville" },
  { slugA: "chicago-il", slugB: "dallas-tx", label: "Chicago vs Dallas" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/">
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Image
                  src="/favicon.svg"
                  alt="CostWise"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <span className="font-bold text-lg">CostWise</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free, data-driven cost of living comparisons for US cities using
              Census, BEA, HUD, and BLS data.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Top Cities</h4>
            <ul className="space-y-2">
              {topCityLinks.map((city) => (
                <li key={city.slug}>
                  <Link href={`/cost-of-living/${city.slug}`}>
                    <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                      {city.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Popular Comparisons</h4>
            <ul className="space-y-2">
              {compareLinks.map((link) => (
                <li key={`${link.slugA}-${link.slugB}`}>
                  <Link href={`/compare/${link.slugA}/vs/${link.slugB}`}>
                    <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/salary-calculator">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Salary Calculator
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cheapest-cities">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Cheapest Cities
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/states">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Cost of Living by State
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cheapest-cities?state=TX">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Cheapest Cities in Texas
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cheapest-cities?state=CA">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Cheapest Cities in California
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cheapest-cities?state=FL">
                  <span className="text-sm text-muted-foreground cursor-pointer hover-elevate rounded-sm">
                    Cheapest Cities in Florida
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CostWise. Data sourced from US Census
            Bureau, BEA, HUD, and BLS.
          </p>
          <p className="text-xs text-muted-foreground">
            Data is updated periodically. For reference only.
          </p>
        </div>
      </div>
    </footer>
  );
}
