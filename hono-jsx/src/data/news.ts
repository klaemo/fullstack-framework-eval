export type NewsImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type StoryLink = {
  section: string;
  title: string;
  href: string;
};

export type LatestItem = {
  time: string;
  title: string;
  href: string;
};

export type Article = {
  slug: string;
  section: string;
  title: string;
  dek: string;
  byline: string;
  readTime: string;
  image: NewsImage;
  body: string[];
};

export const metrics = [
  { label: "Markets", value: "+0.8%" },
  { label: "Weather", value: "24 C" },
  { label: "Briefing", value: "12 stories" },
];

export const articles: Article[] = [
  {
    slug: "cities-prepare-hotter-denser-decade",
    section: "World",
    title: "Cities prepare for a hotter, denser decade",
    dek: "New infrastructure plans are reshaping transit, housing, and public space.",
    byline: "Mara Keene",
    readTime: "6 min read",
    image: {
      src: "/images/lead-city.svg",
      alt: "Dense city skyline with transit lines at sunrise",
      width: 1200,
      height: 720,
    },
    body: [
      "City planners are pairing cooling corridors with denser housing policy.",
      "The result is a new generation of infrastructure plans built around shade, transit, and resilience.",
      "Local agencies say the next decade of public works will be judged by how well streets, stations, and homes perform during extreme heat.",
    ],
  },
];

export const homepage = {
  edition: "Global",
  updatedAt: "2026-07-01T08:30:00.000Z",
  metrics,
  lead: articles[0],
  topStories: [
    { section: "Business", title: "Chip demand redraws the server map", href: "/articles/cities-prepare-hotter-denser-decade" },
    { section: "Culture", title: "Streaming bundles start to look like cable", href: "/articles/cities-prepare-hotter-denser-decade" },
    { section: "Science", title: "Ocean sensors reveal faster coastal warming", href: "/articles/cities-prepare-hotter-denser-decade" },
  ] satisfies StoryLink[],
  latest: [
    { time: "08:15", title: "Election officials test new audit process", href: "/articles/cities-prepare-hotter-denser-decade" },
    { time: "07:50", title: "Airlines add summer capacity on regional routes", href: "/articles/cities-prepare-hotter-denser-decade" },
    { time: "07:20", title: "Researchers publish battery recycling benchmark", href: "/articles/cities-prepare-hotter-denser-decade" },
  ] satisfies LatestItem[],
  images: {
    lead: articles[0].image,
    business: {
      src: "/images/server-map.svg",
      alt: "Abstract server racks connected by bright routing lines",
      width: 900,
      height: 540,
    },
    coastline: {
      src: "/images/coast-sensors.svg",
      alt: "Ocean sensor buoys near a warm coastline",
      width: 900,
      height: 540,
    },
  },
};

export async function getHomepage() {
  await Promise.resolve();
  return homepage;
}

export async function getArticle(slug: string) {
  await Promise.resolve();
  return articles.find((article) => article.slug === slug) ?? null;
}
