import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Home,
  Zap,
  Phone,
  Fuel,
  ShoppingCart,
  Stethoscope,
  DollarSign,
  Building2,
  TrendingDown,
  TrendingUp,
  Eye,
  PawPrint,
  Pill,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/FAQSection";
import {
  getPayscaleCityBySlug,
  getStateBySlug,
  getPayscaleCitiesByState,
} from "@/lib/storage";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string; citySlug: string }>;
}

function parsePct(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  return parseInt(v.replace(/[^0-9\-.]/g, ""), 10) || undefined;
}

function pctBadge(v: string | null | undefined, size: "sm" | "lg" = "sm") {
  if (!v) return <span className="text-muted-foreground">—</span>;
  const num = parsePct(v);
  const color =
    num !== undefined && num < 0
      ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300"
      : num !== undefined && num > 0
        ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
        : "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300";
  return (
    <Badge
      className={`${color} ${size === "lg" ? "text-sm px-3 py-1" : "text-xs"}`}
    >
      {v} vs avg
    </Badge>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, citySlug } = await params;
  const city = await getPayscaleCityBySlug(slug, citySlug).catch(
    () => undefined,
  );
  if (!city) return { title: "City Not Found" };

  const overall = city.overallVsNationalAvg ?? "average";
  const rent = city.housing?.medianRent ?? "";

  return {
    title: `Cost of Living in ${city.name}, ${city.stateName} – Housing, Rent & Expenses (2026)`,
    description: `Detailed cost of living in ${city.name}, ${city.stateName}. Overall costs are ${overall} vs the national average. ${rent ? `Median rent: ${rent}. ` : ""}Compare housing, groceries, healthcare, utilities, and transportation expenses. Updated 2026.`,
    keywords: [
      `cost of living in ${city.name} ${city.stateName}`,
      `${city.name} ${city.stateName} cost of living`,
      `${city.name} rent prices`,
      `${city.name} housing costs`,
      `living in ${city.name} ${city.stateName}`,
      `${city.name} median home price`,
      `${city.name} grocery prices`,
      `${city.name} healthcare costs`,
      `${city.name} utility costs`,
      `move to ${city.name}`,
      `${city.name} salary`,
      `${city.name} expenses`,
    ],
    openGraph: {
      title: `Cost of Living in ${city.name}, ${city.stateName} | CostWise`,
      description: `${city.name} is ${overall} vs national average. ${rent ? `Median rent: ${rent}. ` : ""}Explore detailed breakdowns of housing, food, healthcare, and more.`,
    },
  };
}

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
}

export default async function PayscaleCityPage({ params }: Props) {
  const { slug, citySlug } = await params;

  const [city, state, siblings] = await Promise.all([
    getPayscaleCityBySlug(slug, citySlug).catch(() => undefined),
    getStateBySlug(slug).catch(() => undefined),
    getPayscaleCitiesByState(slug).catch(() => []),
  ]);

  if (!city) notFound();

  // Pick nearby cities (siblings excluding current, limited to 12)
  const nearbyCities = siblings
    .filter((c) => c.slug !== city.slug)
    .slice(0, 12);

  const cc = city.categoryComparisons;
  const h = city.housing;
  const f = city.foodGrocery;
  const hc = city.healthcare;
  const overall = city.overallVsNationalAvg;

  const faqItems = [
    {
      question: `What is the cost of living in ${city.name}, ${city.stateName}?`,
      answer: `${city.name}, ${city.stateName} has an overall cost of living that is ${overall ?? "close to"} the national average. ${
        cc?.Housing
          ? `Housing costs are ${cc.Housing} vs the national average. `
          : ""
      }${cc?.Groceries ? `Grocery prices are ${cc.Groceries} vs average. ` : ""}${
        cc?.Utilities ? `Utilities are ${cc.Utilities} vs average. ` : ""
      }This makes ${city.name} ${
        parsePct(overall) !== undefined && (parsePct(overall) ?? 0) < -10
          ? "a very affordable place to live"
          : parsePct(overall) !== undefined && (parsePct(overall) ?? 0) < 0
            ? "a reasonably affordable city"
            : parsePct(overall) !== undefined && (parsePct(overall) ?? 0) > 10
              ? "a relatively expensive city"
              : "a city with costs close to national averages"
      }.`,
    },
    {
      question: `What is the average rent in ${city.name}?`,
      answer: h?.medianRent
        ? `The median rent in ${city.name}, ${city.stateName} is ${h.medianRent}. ${
            h.energyBill ? `Average energy bills run ${h.energyBill}. ` : ""
          }${h.phoneBill ? `Phone bills average ${h.phoneBill}. ` : ""}Housing is typically the largest expense for residents.`
        : `Specific rent data for ${city.name} is available on this page. Housing costs in ${city.stateName} average around $${state?.avgMedianRent?.toLocaleString() ?? "N/A"} per month statewide.`,
    },
    {
      question: `How much does healthcare cost in ${city.name}?`,
      answer:
        hc?.doctorsVisit || hc?.dentistVisit
          ? `Healthcare costs in ${city.name}: ${hc.doctorsVisit ? `doctor's visit averages ${hc.doctorsVisit}` : ""}${hc.dentistVisit ? `, dentist visit averages ${hc.dentistVisit}` : ""}${hc.rxDrug ? `, prescription drugs average ${hc.rxDrug}` : ""}. ${
              cc?.Groceries
                ? `Overall healthcare expenses in the area are influenced by the ${cc.Groceries} grocery cost difference.`
                : ""
            }`
          : `Healthcare costs in ${city.name}, ${city.stateName} are available in the detailed breakdown above.`,
    },
    {
      question: `How does ${city.name} compare to other cities in ${city.stateName}?`,
      answer: `${city.name} is one of ${state?.totalCities ?? "many"} cities tracked in ${city.stateName}. ${
        overall
          ? `With an overall cost ${overall} vs the national average, it ${
              (parsePct(overall) ?? 0) < 0
                ? "is more affordable than many other cities in the state"
                : "tends to be pricier than some smaller communities"
            }.`
          : ""
      } Visit our ${city.stateName} state page to compare all cities side-by-side and find the best fit for your budget.`,
    },
    {
      question: `Is ${city.name} a good place to move to?`,
      answer: `${city.name} offers ${overall ? `cost of living ${overall} compared to the national average` : "a range of living costs"}. Key factors to consider: ${
        h?.medianHomePrice ? `median home price of ${h.medianHomePrice}, ` : ""
      }${h?.medianRent ? `rent of ${h.medianRent}, ` : ""}${
        (state?.avgTaxRate ?? 0) === 0
          ? `and no state income tax in ${city.stateName}`
          : `and a state income tax of ${state?.avgTaxRate ?? "N/A"}% in ${city.stateName}`
      }. Explore our detailed cost breakdown above to see if ${city.name} fits your budget.`,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-3 bg-white/20 text-white border-white/30">
            {city.stateName} &bull; 2026 Data
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Cost of Living in {city.name}, {city.stateName}
          </h1>
          {overall && (
            <p className="text-lg text-white/90 flex items-center gap-2 mb-2">
              Overall cost of living:{" "}
              <span className="font-bold text-xl">{overall}</span> vs national
              average
            </p>
          )}
          <p className="text-white/70 text-sm">
            Detailed housing, grocery, healthcare, and utility cost data for{" "}
            {city.name}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/">
            <span className="cursor-pointer hover-elevate rounded-sm">
              Home
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/states">
            <span className="cursor-pointer hover-elevate rounded-sm">
              States
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/states/${slug}`}>
            <span className="cursor-pointer hover-elevate rounded-sm">
              {city.stateName}
            </span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{city.name}</span>
        </nav>

        {/* Category Comparison Badges */}
        {cc && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(
              ["Housing", "Utilities", "Groceries", "Transportation"] as const
            ).map(
              (key) =>
                cc[key] !== undefined && (
                  <Card key={key}>
                    <CardContent className="p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">
                        {key}
                      </div>
                      {pctBadge(cc[key], "lg")}
                    </CardContent>
                  </Card>
                ),
            )}
          </div>
        )}

        {/* Data Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Housing */}
          {h && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5 text-primary" />
                  Housing &amp; Utilities
                </CardTitle>
                {cc?.Housing && (
                  <div className="mt-1">{pctBadge(cc.Housing)}</div>
                )}
              </CardHeader>
              <CardContent>
                <DataRow
                  icon={Building2}
                  label="Median Home Price"
                  value={h.medianHomePrice}
                />
                <DataRow
                  icon={DollarSign}
                  label="Median Rent"
                  value={h.medianRent}
                />
                <DataRow icon={Zap} label="Energy Bill" value={h.energyBill} />
                <DataRow icon={Phone} label="Phone Bill" value={h.phoneBill} />
                <DataRow icon={Fuel} label="Gas (per gallon)" value={h.gas} />
              </CardContent>
            </Card>
          )}

          {/* Food & Grocery */}
          {f && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Food &amp; Grocery
                </CardTitle>
                {cc?.Groceries && (
                  <div className="mt-1">{pctBadge(cc.Groceries)}</div>
                )}
              </CardHeader>
              <CardContent>
                <DataRow
                  icon={ShoppingCart}
                  label="Loaf of Bread"
                  value={f.loafOfBread}
                />
                <DataRow
                  icon={ShoppingCart}
                  label="Gallon of Milk"
                  value={f.gallonOfMilk}
                />
                <DataRow
                  icon={ShoppingCart}
                  label="Carton of Eggs"
                  value={f.cartonOfEggs}
                />
                <DataRow
                  icon={ShoppingCart}
                  label="Bunch of Bananas"
                  value={f.bunchOfBananas}
                />
                <DataRow
                  icon={ShoppingCart}
                  label="Hamburger"
                  value={f.hamburger}
                />
              </CardContent>
            </Card>
          )}

          {/* Healthcare */}
          {hc && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Healthcare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataRow
                  icon={Stethoscope}
                  label="Doctor's Visit"
                  value={hc.doctorsVisit}
                />
                <DataRow
                  icon={Stethoscope}
                  label="Dentist Visit"
                  value={hc.dentistVisit}
                />
                <DataRow
                  icon={Eye}
                  label="Optometrist Visit"
                  value={hc.optometristVisit}
                />
                <DataRow icon={Pill} label="Rx Drug" value={hc.rxDrug} />
                <DataRow
                  icon={PawPrint}
                  label="Veterinary Visit"
                  value={hc.veterinaryVisit}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* State Context */}
        {state && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-3">
                {city.name} in the Context of {state.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">
                    State Avg Cost Index
                  </span>
                  <span className="font-bold text-lg">
                    {state.avgCostIndex?.toFixed(1) ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    State Avg Rent
                  </span>
                  <span className="font-bold text-lg">
                    ${state.avgMedianRent?.toLocaleString() ?? "N/A"}/mo
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    State Income Tax
                  </span>
                  <span className="font-bold text-lg">
                    {(state.avgTaxRate ?? 0) === 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        None
                      </span>
                    ) : (
                      `${state.avgTaxRate}%`
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    Cities in State
                  </span>
                  <span className="font-bold text-lg">{state.totalCities}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Cities */}
        {nearbyCities.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">
              Other Cities in {city.stateName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyCities.map((nc) => (
                <Link key={nc.slug} href={`/states/${slug}/${nc.slug}`}>
                  <Card className="hover-elevate cursor-pointer">
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{nc.name}</div>
                      {nc.overallVsNationalAvg && (
                        <div className="mt-1">
                          {pctBadge(nc.overallVsNationalAvg)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link href={`/states/${slug}`}>
                <span className="text-sm text-primary hover:underline">
                  View all {state?.totalCities ?? ""} cities in {city.stateName}{" "}
                  →
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              About Living in {city.name}, {city.stateName}
            </h2>
            <div className="prose prose-sm text-muted-foreground max-w-none space-y-3">
              <p>
                {city.name} is located in {city.stateName} and has an overall
                cost of living that is{" "}
                {overall
                  ? `${overall} compared to the national average`
                  : "close to the national average"}
                . Understanding the full picture of living expenses — from
                housing and rent to grocery bills and healthcare — is essential
                when considering a move to {city.name}.
              </p>
              {h?.medianRent && (
                <p>
                  <strong>Housing:</strong> Median rent in {city.name} is{" "}
                  {h.medianRent}
                  {h.medianHomePrice
                    ? `, and the median home price is ${h.medianHomePrice}`
                    : ""}
                  .{" "}
                  {cc?.Housing
                    ? `Housing costs are ${cc.Housing} compared to the national average, which significantly impacts monthly budgets.`
                    : ""}
                </p>
              )}
              {f && (
                <p>
                  <strong>Groceries:</strong> Daily essentials like bread (
                  {f.loafOfBread}), milk ({f.gallonOfMilk}), and eggs (
                  {f.cartonOfEggs}) reflect the local grocery landscape.{" "}
                  {cc?.Groceries
                    ? `Overall grocery costs are ${cc.Groceries} vs the national average.`
                    : ""}
                </p>
              )}
              {hc && (
                <p>
                  <strong>Healthcare:</strong> Medical costs include doctor
                  visits ({hc.doctorsVisit}), dentist visits ({hc.dentistVisit}
                  ), and prescription drugs ({hc.rxDrug}). These costs should be
                  factored into your monthly budget when planning a move.
                </p>
              )}
              <p>
                {(state?.avgTaxRate ?? 0) === 0
                  ? `${city.stateName} has no state income tax, which means residents of ${city.name} keep more of their earnings. This is especially beneficial for high-income earners and retirees.`
                  : `${city.stateName} has a state income tax rate of ${state?.avgTaxRate ?? "N/A"}%, which affects take-home pay for ${city.name} residents.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <FAQSection
          title={`${city.name}, ${city.stateName} Cost of Living FAQ`}
          subtitle={`Common questions about living costs in ${city.name}.`}
          items={faqItems}
        />
      </div>
    </div>
  );
}
