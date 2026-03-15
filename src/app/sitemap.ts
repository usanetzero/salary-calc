import { MetadataRoute } from "next";
import {
  getAllCities,
  getAllStates,
  getPayscaleCitiesByState,
} from "@/lib/storage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://costwise.usa-net-zero.com";

// Top city pairs for cost-of-living comparisons in sitemap
const TOP_COMPARE_PAIRS = [
  ["new-york-ny", "los-angeles-ca"],
  ["new-york-ny", "austin-tx"],
  ["new-york-ny", "miami-fl"],
  ["new-york-ny", "chicago-il"],
  ["new-york-ny", "seattle-wa"],
  ["new-york-ny", "boston-ma"],
  ["new-york-ny", "washington-dc"],
  ["new-york-ny", "denver-co"],
  ["los-angeles-ca", "san-francisco-ca"],
  ["los-angeles-ca", "chicago-il"],
  ["los-angeles-ca", "austin-tx"],
  ["los-angeles-ca", "seattle-wa"],
  ["los-angeles-ca", "miami-fl"],
  ["los-angeles-ca", "denver-co"],
  ["san-francisco-ca", "seattle-wa"],
  ["san-francisco-ca", "austin-tx"],
  ["san-francisco-ca", "denver-co"],
  ["san-francisco-ca", "new-york-ny"],
  ["austin-tx", "dallas-tx"],
  ["austin-tx", "houston-tx"],
  ["austin-tx", "denver-co"],
  ["austin-tx", "nashville-tn"],
  ["austin-tx", "miami-fl"],
  ["austin-tx", "seattle-wa"],
  ["dallas-tx", "houston-tx"],
  ["dallas-tx", "chicago-il"],
  ["dallas-tx", "miami-fl"],
  ["chicago-il", "dallas-tx"],
  ["chicago-il", "miami-fl"],
  ["chicago-il", "houston-tx"],
  ["miami-fl", "nashville-tn"],
  ["miami-fl", "tampa-fl"],
  ["miami-fl", "orlando-fl"],
  ["miami-fl", "charlotte-nc"],
  ["seattle-wa", "portland-or"],
  ["seattle-wa", "denver-co"],
  ["denver-co", "phoenix-az"],
  ["denver-co", "austin-tx"],
  ["denver-co", "chicago-il"],
  ["phoenix-az", "las-vegas-nv"],
  ["phoenix-az", "tucson-az"],
  ["phoenix-az", "denver-co"],
  ["boston-ma", "new-york-ny"],
  ["boston-ma", "washington-dc"],
  ["washington-dc", "baltimore-md"],
  ["washington-dc", "richmond-va"],
  ["washington-dc", "charlotte-nc"],
  ["nashville-tn", "memphis-tn"],
  ["nashville-tn", "atlanta-ga"],
  ["nashville-tn", "charlotte-nc"],
  ["charlotte-nc", "raleigh-nc"],
  ["charlotte-nc", "atlanta-ga"],
  ["atlanta-ga", "nashville-tn"],
  ["atlanta-ga", "miami-fl"],
  ["portland-or", "seattle-wa"],
  ["las-vegas-nv", "phoenix-az"],
  ["las-vegas-nv", "los-angeles-ca"],
  ["san-diego-ca", "los-angeles-ca"],
  ["san-diego-ca", "san-jose-ca"],
  ["minneapolis-mn", "chicago-il"],
  ["st-louis-mo", "kansas-city-mo"],
  ["pittsburgh-pa", "philadelphia-pa"],
  ["indianapolis-in", "columbus-oh"],
  ["oklahoma-city-ok", "dallas-tx"],
  ["omaha-ne", "kansas-city-mo"],
  ["wichita-ks", "kansas-city-mo"],
  ["memphis-tn", "nashville-tn"],
  ["louisville-ky", "nashville-tn"],
  ["virginia-beach-va", "washington-dc"],
  ["sacramento-ca", "san-francisco-ca"],
  ["albuquerque-nm", "phoenix-az"],
  ["tucson-az", "phoenix-az"],
  ["colorado-springs-co", "denver-co"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, states] = await Promise.all([
    getAllCities().catch(() => []),
    getAllStates().catch(() => []),
  ]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/salary-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cheapest-cities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/states`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${SITE_URL}/cost-of-living/${city.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const comparePages: MetadataRoute.Sitemap = TOP_COMPARE_PAIRS.map(
    ([a, b]) => ({
      url: `${SITE_URL}/compare/${a}/vs/${b}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  // State pages
  const statePages: MetadataRoute.Sitemap = states.map((st) => ({
    url: `${SITE_URL}/states/${st.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Payscale city pages — fetch all payscale cities for all states
  const payscaleCityPages: MetadataRoute.Sitemap = [];
  for (const st of states) {
    try {
      const pCities = await getPayscaleCitiesByState(st.slug);
      for (const pc of pCities) {
        payscaleCityPages.push({
          url: `${SITE_URL}/states/${st.slug}/${pc.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }
    } catch {
      // skip
    }
  }

  return [
    ...staticPages,
    ...cityPages,
    ...comparePages,
    ...statePages,
    ...payscaleCityPages,
  ];
}
