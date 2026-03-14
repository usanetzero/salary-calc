/**
 * Geographic identifiers for each city used to pull data from government APIs.
 *
 * Census FIPS: state + place code
 * CBSA: Core Based Statistical Area code
 * BLS CPI area: Metro area code for BLS CPI
 *
 * State income tax rates (top marginal rate as of 2026).
 * Source: Tax Foundation State Individual Income Tax Rates
 */

export interface CityMapping {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  censusFips: { state: string; place: string };
  cbsaCode: string;
  blsCpiAreaCode?: string;
  stateTaxRate: number;
  description: string;
}

/**
 * Build the BLS LAUS unemployment rate series ID for a metro area.
 * Format: LAUMT + state_fips(2) + CBSA(5) + zero_padding(5) + measure(3) = 20 chars
 */
export function buildLAUSSeriesId(city: CityMapping): string {
  const stateFips = city.censusFips.state.padStart(2, "0");
  const cbsa = city.cbsaCode.padStart(5, "0");
  const areaCode = `${stateFips}${cbsa}00000`;
  return `LAUMT${areaCode}003`;
}

export const CITY_MAPPINGS: CityMapping[] = [
  {
    slug: "new-york-ny",
    name: "New York City",
    state: "New York",
    stateCode: "NY",
    censusFips: { state: "36", place: "51000" },
    cbsaCode: "35620",
    blsCpiAreaCode: "S11A",
    stateTaxRate: 10.9,
    description:
      "New York City is the most populous city in the United States and a global center of finance, culture, and innovation. While salaries are among the highest in the nation, the cost of living remains extremely high, particularly for housing.",
  },
  {
    slug: "los-angeles-ca",
    name: "Los Angeles",
    state: "California",
    stateCode: "CA",
    censusFips: { state: "06", place: "44000" },
    cbsaCode: "31080",
    blsCpiAreaCode: "S49A",
    stateTaxRate: 13.3,
    description:
      "Los Angeles is a sprawling Southern California city known for entertainment, tech, and sunshine. Housing costs are very high, but the strong job market in media, tech, and creative industries supports higher wages.",
  },
  {
    slug: "chicago-il",
    name: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    censusFips: { state: "17", place: "14000" },
    cbsaCode: "16980",
    blsCpiAreaCode: "S23A",
    stateTaxRate: 4.95,
    description:
      "Chicago offers big-city amenities at a fraction of the cost of coastal metros. A major center for finance, manufacturing, and healthcare, Chicago provides strong career opportunities with a more affordable lifestyle.",
  },
  {
    slug: "houston-tx",
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    censusFips: { state: "48", place: "35000" },
    cbsaCode: "26420",
    blsCpiAreaCode: "S35C",
    stateTaxRate: 0,
    description:
      "Houston is the energy capital of the world and one of the most affordable major cities in the US. With no state income tax and low housing costs, your dollar goes much further here than in coastal cities.",
  },
  {
    slug: "phoenix-az",
    name: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    censusFips: { state: "04", place: "55000" },
    cbsaCode: "38060",
    blsCpiAreaCode: "S48A",
    stateTaxRate: 2.5,
    description:
      "Phoenix offers a warm climate, affordable housing, and a growing economy. The tech and healthcare sectors are expanding rapidly, making it a popular destination for young professionals seeking a lower cost of living.",
  },
  {
    slug: "san-antonio-tx",
    name: "San Antonio",
    state: "Texas",
    stateCode: "TX",
    censusFips: { state: "48", place: "65000" },
    cbsaCode: "41700",
    stateTaxRate: 0,
    description:
      "San Antonio is one of the most affordable major cities in the US, with very low housing costs and no state income tax. The military, healthcare, and tourism sectors provide stable employment.",
  },
  {
    slug: "san-diego-ca",
    name: "San Diego",
    state: "California",
    stateCode: "CA",
    censusFips: { state: "06", place: "66000" },
    cbsaCode: "41740",
    blsCpiAreaCode: "S49E",
    stateTaxRate: 13.3,
    description:
      "San Diego offers near-perfect weather, world-class beaches, and a diverse economy spanning defense, biotech, and tourism. While expensive, it remains more affordable than San Francisco and Los Angeles.",
  },
  {
    slug: "dallas-tx",
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    censusFips: { state: "48", place: "19000" },
    cbsaCode: "19100",
    blsCpiAreaCode: "S35B",
    stateTaxRate: 0,
    description:
      "Dallas is a sprawling metropolis and economic powerhouse with a diverse job market spanning finance, tech, telecom, and manufacturing. No state income tax and relatively affordable housing make it a top destination.",
  },
  {
    slug: "san-jose-ca",
    name: "San Jose",
    state: "California",
    stateCode: "CA",
    censusFips: { state: "06", place: "68000" },
    cbsaCode: "41940",
    stateTaxRate: 13.3,
    description:
      "San Jose sits at the heart of Silicon Valley with the highest median household income among major US cities. Tech giants like Apple, Google, and Intel dominate the job market, but housing costs are astronomical.",
  },
  {
    slug: "austin-tx",
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    censusFips: { state: "48", place: "05000" },
    cbsaCode: "12420",
    stateTaxRate: 0,
    description:
      "Austin has transformed from a college town into a major tech and startup hub, attracting companies like Tesla, Apple, and Dell. Texas has no state income tax, making it especially attractive for high earners.",
  },
  {
    slug: "jacksonville-fl",
    name: "Jacksonville",
    state: "Florida",
    stateCode: "FL",
    censusFips: { state: "12", place: "35000" },
    cbsaCode: "27260",
    stateTaxRate: 0,
    description:
      "Jacksonville is Florida's largest city by area and one of its most affordable. The military, financial services, and logistics sectors drive the economy. No state income tax adds to its financial appeal.",
  },
  {
    slug: "columbus-oh",
    name: "Columbus",
    state: "Ohio",
    stateCode: "OH",
    censusFips: { state: "39", place: "18000" },
    cbsaCode: "18140",
    stateTaxRate: 3.99,
    description:
      "Columbus is Ohio's thriving capital city with a strong university presence (Ohio State), growing tech sector, and one of the most affordable housing markets among large Midwestern cities.",
  },
  {
    slug: "indianapolis-in",
    name: "Indianapolis",
    state: "Indiana",
    stateCode: "IN",
    censusFips: { state: "18", place: "36003" },
    cbsaCode: "26900",
    stateTaxRate: 3.05,
    description:
      "Indianapolis offers a remarkably affordable cost of living with a diversified economy spanning healthcare, manufacturing, and sports. It's one of the most underrated cities in the Midwest for young professionals.",
  },
  {
    slug: "charlotte-nc",
    name: "Charlotte",
    state: "North Carolina",
    stateCode: "NC",
    censusFips: { state: "37", place: "12000" },
    cbsaCode: "16740",
    stateTaxRate: 3.99,
    description:
      "Charlotte is the second-largest US banking center after New York and a rapidly growing tech hub. Low cost of living, mild climate, and strong job growth make Charlotte one of the most attractive cities in the Southeast.",
  },
  {
    slug: "san-francisco-ca",
    name: "San Francisco",
    state: "California",
    stateCode: "CA",
    censusFips: { state: "06", place: "67000" },
    cbsaCode: "41860",
    blsCpiAreaCode: "S49B",
    stateTaxRate: 13.3,
    description:
      "San Francisco is the epicenter of the global tech industry with the highest median incomes in the US. However, housing costs have reached crisis levels, making it one of the most expensive cities worldwide.",
  },
  {
    slug: "seattle-wa",
    name: "Seattle",
    state: "Washington",
    stateCode: "WA",
    censusFips: { state: "53", place: "63000" },
    cbsaCode: "42660",
    blsCpiAreaCode: "S49D",
    stateTaxRate: 0,
    description:
      "Seattle is a major tech hub home to Amazon and Microsoft. Washington state has no income tax, making it attractive for high earners. The city offers stunning natural beauty alongside a thriving economy.",
  },
  {
    slug: "denver-co",
    name: "Denver",
    state: "Colorado",
    stateCode: "CO",
    censusFips: { state: "08", place: "20000" },
    cbsaCode: "19740",
    blsCpiAreaCode: "S48B",
    stateTaxRate: 4.4,
    description:
      "Denver sits at the foot of the Rocky Mountains and has evolved into a major tech and aerospace hub. Outdoor recreation opportunities are unmatched, though housing costs have risen significantly in recent years.",
  },
  {
    slug: "oklahoma-city-ok",
    name: "Oklahoma City",
    state: "Oklahoma",
    stateCode: "OK",
    censusFips: { state: "40", place: "55000" },
    cbsaCode: "36420",
    stateTaxRate: 4.75,
    description:
      "Oklahoma City is one of America's most underrated cities, offering very affordable housing and a diversified economy spanning energy, aerospace, and healthcare. The city has invested heavily in downtown revitalization.",
  },
  {
    slug: "washington-dc",
    name: "Washington DC",
    state: "Washington DC",
    stateCode: "DC",
    censusFips: { state: "11", place: "50000" },
    cbsaCode: "47900",
    blsCpiAreaCode: "S35A",
    stateTaxRate: 10.75,
    description:
      "Washington DC is the seat of the federal government and a major hub for law, politics, healthcare, and technology. High incomes from government and contractor jobs are offset by very high housing costs.",
  },
  {
    slug: "nashville-tn",
    name: "Nashville",
    state: "Tennessee",
    stateCode: "TN",
    censusFips: { state: "47", place: "52006" },
    cbsaCode: "34980",
    stateTaxRate: 0,
    description:
      "Nashville has exploded in growth as a hub for healthcare, music, and tech. Tennessee has no income tax on wages, and while housing costs have risen, Nashville still offers a lower cost of living than coastal cities.",
  },
  {
    slug: "el-paso-tx",
    name: "El Paso",
    state: "Texas",
    stateCode: "TX",
    censusFips: { state: "48", place: "24000" },
    cbsaCode: "21340",
    stateTaxRate: 0,
    description:
      "El Paso is one of the most affordable large cities in America, sitting on the US-Mexico border. Fort Bliss military base is a major employer, and the growing healthcare and manufacturing sectors offer solid middle-class opportunities.",
  },
  {
    slug: "boston-ma",
    name: "Boston",
    state: "Massachusetts",
    stateCode: "MA",
    censusFips: { state: "25", place: "07000" },
    cbsaCode: "14460",
    blsCpiAreaCode: "S12B",
    stateTaxRate: 5.0,
    description:
      "Boston is a world-class city known for its prestigious universities, medical research, and biotech industry. The cost of living is very high, but strong wages in healthcare, education, and tech offset this.",
  },
  {
    slug: "detroit-mi",
    name: "Detroit",
    state: "Michigan",
    stateCode: "MI",
    censusFips: { state: "26", place: "22000" },
    cbsaCode: "19820",
    blsCpiAreaCode: "S23B",
    stateTaxRate: 4.25,
    description:
      "Detroit is one of the most affordable major cities in America, undergoing significant revitalization. The automotive industry, healthcare, and tech sectors are driving economic recovery in this historic American city.",
  },
  {
    slug: "portland-or",
    name: "Portland",
    state: "Oregon",
    stateCode: "OR",
    censusFips: { state: "41", place: "59000" },
    cbsaCode: "38900",
    blsCpiAreaCode: "S49F",
    stateTaxRate: 9.9,
    description:
      "Portland is a culturally rich Pacific Northwest city with strong tech and manufacturing sectors. While Oregon has no sales tax, high income taxes and rising housing costs push the overall cost of living above the national average.",
  },
  {
    slug: "las-vegas-nv",
    name: "Las Vegas",
    state: "Nevada",
    stateCode: "NV",
    censusFips: { state: "32", place: "40000" },
    cbsaCode: "29820",
    stateTaxRate: 0,
    description:
      "Las Vegas has evolved beyond gambling into a diverse economy spanning entertainment, conventions, and healthcare. Nevada has no income tax, and housing is relatively affordable compared to other Western cities.",
  },
  {
    slug: "memphis-tn",
    name: "Memphis",
    state: "Tennessee",
    stateCode: "TN",
    censusFips: { state: "47", place: "48000" },
    cbsaCode: "32820",
    stateTaxRate: 0,
    description:
      "Memphis is one of the most affordable major cities in America, with very low housing costs and no state income tax. It serves as a major logistics and distribution hub, home to FedEx's global headquarters.",
  },
  {
    slug: "louisville-ky",
    name: "Louisville",
    state: "Kentucky",
    stateCode: "KY",
    censusFips: { state: "21", place: "48006" },
    cbsaCode: "31140",
    stateTaxRate: 4.5,
    description:
      "Louisville is an affordable Mid-South city known for bourbon, horse racing, and a growing manufacturing and healthcare sector. The city offers a high quality of life at a very reasonable price.",
  },
  {
    slug: "baltimore-md",
    name: "Baltimore",
    state: "Maryland",
    stateCode: "MD",
    censusFips: { state: "24", place: "04000" },
    cbsaCode: "12580",
    blsCpiAreaCode: "S35A",
    stateTaxRate: 5.75,
    description:
      "Baltimore is a historic port city with world-class healthcare institutions like Johns Hopkins. Its proximity to Washington DC makes it popular for commuters seeking more affordable housing in the DC metro area.",
  },
  {
    slug: "milwaukee-wi",
    name: "Milwaukee",
    state: "Wisconsin",
    stateCode: "WI",
    censusFips: { state: "55", place: "53000" },
    cbsaCode: "33340",
    blsCpiAreaCode: "S24B",
    stateTaxRate: 7.65,
    description:
      "Milwaukee is one of the most affordable major cities in the US with a rich industrial heritage. The city is revitalizing its waterfront and downtown, attracting new businesses and young professionals.",
  },
  {
    slug: "albuquerque-nm",
    name: "Albuquerque",
    state: "New Mexico",
    stateCode: "NM",
    censusFips: { state: "35", place: "02000" },
    cbsaCode: "10740",
    stateTaxRate: 5.9,
    description:
      "Albuquerque sits in the high desert of New Mexico with a unique Southwestern culture. Government, healthcare, and aerospace sectors are major employers. Housing remains very affordable compared to other Western cities.",
  },
  {
    slug: "tucson-az",
    name: "Tucson",
    state: "Arizona",
    stateCode: "AZ",
    censusFips: { state: "04", place: "77000" },
    cbsaCode: "46060",
    stateTaxRate: 2.5,
    description:
      "Tucson is an affordable desert city surrounded by stunning mountain scenery. The University of Arizona is a major economic driver, and the growing tech sector is attracting new investment to this Sun Belt city.",
  },
  {
    slug: "sacramento-ca",
    name: "Sacramento",
    state: "California",
    stateCode: "CA",
    censusFips: { state: "06", place: "64000" },
    cbsaCode: "40900",
    stateTaxRate: 13.3,
    description:
      "Sacramento is California's capital and offers a more affordable alternative to the Bay Area, with many workers commuting to San Francisco. The government, healthcare, and tech sectors drive the local economy.",
  },
  {
    slug: "atlanta-ga",
    name: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    censusFips: { state: "13", place: "04000" },
    cbsaCode: "12060",
    blsCpiAreaCode: "S35D",
    stateTaxRate: 5.39,
    description:
      "Atlanta is the economic engine of the Southeast, home to major corporations like Delta, Coca-Cola, and CNN. The city offers diverse career opportunities and a lower cost of living compared to similar-sized northern cities.",
  },
  {
    slug: "kansas-city-mo",
    name: "Kansas City",
    state: "Missouri",
    stateCode: "MO",
    censusFips: { state: "29", place: "38000" },
    cbsaCode: "28140",
    stateTaxRate: 5.3,
    description:
      "Kansas City is a Midwest gem with world-class barbecue, affordable housing, and a growing tech and creative scene. It sits astride the Missouri-Kansas border, offering access to two different state tax environments.",
  },
  {
    slug: "omaha-ne",
    name: "Omaha",
    state: "Nebraska",
    stateCode: "NE",
    censusFips: { state: "31", place: "37000" },
    cbsaCode: "36540",
    stateTaxRate: 3.99,
    description:
      "Omaha is one of America's most affordable cities with exceptional quality of life metrics. Home to Warren Buffett and Berkshire Hathaway, it has a strong financial services and insurance sector.",
  },
  {
    slug: "colorado-springs-co",
    name: "Colorado Springs",
    state: "Colorado",
    stateCode: "CO",
    censusFips: { state: "08", place: "16000" },
    cbsaCode: "17820",
    stateTaxRate: 4.4,
    description:
      "Colorado Springs offers access to Rocky Mountain outdoor recreation at a lower price than Denver. The military, defense, and tech sectors provide strong employment, and the city regularly ranks among the best places to live.",
  },
  {
    slug: "miami-fl",
    name: "Miami",
    state: "Florida",
    stateCode: "FL",
    censusFips: { state: "12", place: "45000" },
    cbsaCode: "33100",
    blsCpiAreaCode: "S35E",
    stateTaxRate: 0,
    description:
      "Miami is a vibrant international city with no state income tax. The thriving finance, tourism, and tech startup scenes attract global talent. However, housing costs have risen sharply as remote workers relocate here.",
  },
  {
    slug: "raleigh-nc",
    name: "Raleigh",
    state: "North Carolina",
    stateCode: "NC",
    censusFips: { state: "37", place: "55000" },
    cbsaCode: "39580",
    stateTaxRate: 3.99,
    description:
      "Raleigh is the anchor of the Research Triangle, home to world-class universities and a booming tech sector. It consistently ranks as one of the best places to live in the US due to its combination of career opportunities and affordability.",
  },
  {
    slug: "virginia-beach-va",
    name: "Virginia Beach",
    state: "Virginia",
    stateCode: "VA",
    censusFips: { state: "51", place: "82000" },
    cbsaCode: "47260",
    stateTaxRate: 5.75,
    description:
      "Virginia Beach combines Atlantic Ocean beaches with a strong military presence and growing technology sector. The Tidewater region's diversified economy and relatively affordable housing make it a top quality-of-life destination.",
  },
  {
    slug: "minneapolis-mn",
    name: "Minneapolis",
    state: "Minnesota",
    stateCode: "MN",
    censusFips: { state: "27", place: "43000" },
    cbsaCode: "33460",
    blsCpiAreaCode: "S24A",
    stateTaxRate: 9.85,
    description:
      "Minneapolis-Saint Paul is a thriving metro with Fortune 500 headquarters and a strong healthcare sector. Despite high state income taxes, the relatively affordable housing makes the overall cost of living reasonable.",
  },
  {
    slug: "tampa-fl",
    name: "Tampa",
    state: "Florida",
    stateCode: "FL",
    censusFips: { state: "12", place: "71000" },
    cbsaCode: "45300",
    blsCpiAreaCode: "S37A",
    stateTaxRate: 0,
    description:
      "Tampa is one of Florida's fastest-growing cities with a thriving finance, healthcare, and defense sector. No state income tax and beautiful weather make it a top destination, though housing costs have risen sharply.",
  },
  {
    slug: "new-orleans-la",
    name: "New Orleans",
    state: "Louisiana",
    stateCode: "LA",
    censusFips: { state: "22", place: "55000" },
    cbsaCode: "35380",
    stateTaxRate: 3.0,
    description:
      "New Orleans is a culturally unique city with rich culinary traditions, vibrant music scenes, and a growing tech sector. The cost of living is below the national average, though hurricane risk affects insurance costs.",
  },
  {
    slug: "wichita-ks",
    name: "Wichita",
    state: "Kansas",
    stateCode: "KS",
    censusFips: { state: "20", place: "79000" },
    cbsaCode: "48620",
    stateTaxRate: 5.7,
    description:
      "Wichita is the aircraft manufacturing capital of the world, home to Boeing, Cessna, Beechcraft, and Spirit AeroSystems. It offers an exceptionally affordable cost of living with strong manufacturing employment.",
  },
  {
    slug: "cincinnati-oh",
    name: "Cincinnati",
    state: "Ohio",
    stateCode: "OH",
    censusFips: { state: "39", place: "15000" },
    cbsaCode: "17140",
    stateTaxRate: 3.99,
    description:
      "Cincinnati is a charming Ohio River city with a strong manufacturing, healthcare, and consumer goods sector. Procter & Gamble and many Fortune 500 companies call Cincinnati home.",
  },
  {
    slug: "orlando-fl",
    name: "Orlando",
    state: "Florida",
    stateCode: "FL",
    censusFips: { state: "12", place: "53000" },
    cbsaCode: "36740",
    stateTaxRate: 0,
    description:
      "Orlando has diversified beyond theme parks into a major tech, defense, and healthcare hub. No state income tax and a warm climate attract both businesses and remote workers from higher-cost cities.",
  },
  {
    slug: "pittsburgh-pa",
    name: "Pittsburgh",
    state: "Pennsylvania",
    stateCode: "PA",
    censusFips: { state: "42", place: "61000" },
    cbsaCode: "38300",
    stateTaxRate: 3.07,
    description:
      "Pittsburgh has reinvented itself from a steel city into a tech and healthcare hub, home to Carnegie Mellon University and Uber's autonomous vehicle division. Extremely affordable housing makes it a standout value city.",
  },
  {
    slug: "st-louis-mo",
    name: "St. Louis",
    state: "Missouri",
    stateCode: "MO",
    censusFips: { state: "29", place: "65000" },
    cbsaCode: "41180",
    blsCpiAreaCode: "S37B",
    stateTaxRate: 5.3,
    description:
      "St. Louis offers some of the most affordable housing among US cities of any size. The city is experiencing a tech and innovation renaissance, with a growing startup scene and strong healthcare sector.",
  },
];

export const CITY_MAPPING_BY_SLUG = new Map(
  CITY_MAPPINGS.map((c) => [c.slug, c]),
);
export const CITY_MAPPING_BY_CBSA = new Map(
  CITY_MAPPINGS.map((c) => [c.cbsaCode, c]),
);
