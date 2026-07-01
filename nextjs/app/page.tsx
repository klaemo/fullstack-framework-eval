import { NewsChrome } from "./components/NewsChrome";
import { NewsHome } from "./components/NewsHome";
import { getHomepage } from "./data/news";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homepage = await getHomepage();

  return (
    <NewsChrome>
      <NewsHome homepage={homepage} />
    </NewsChrome>
  );
}
