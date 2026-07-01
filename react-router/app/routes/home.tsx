import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { NewsChrome } from "../components/NewsChrome";
import { NewsHome } from "../components/NewsViews";
import { getHomepage } from "../data/news";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Framework Gazette" },
    { name: "description", content: "SSR benchmark news edition" },
  ];
}

export async function loader() {
  return getHomepage();
}

export default function Home() {
  const homepage = useLoaderData<typeof loader>();

  return (
    <NewsChrome>
      <NewsHome homepage={homepage} />
    </NewsChrome>
  );
}
