import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("articles/:slug", "routes/articles.$slug.tsx"),
] satisfies RouteConfig;
