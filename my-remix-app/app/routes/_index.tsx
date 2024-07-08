import type {LinksFunction, MetaFunction} from "@remix-run/node";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/navbar-logo.png" },
    { rel: "manifest", href: "/manifest.json" },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8" },
    { title: "Renpy archives extractor" },
    { name: "description", content: "Hassle free RPA extractor. In-Browser, no code, no exes." },
    { property: "og:site_name", content: "Unrpa" },
    { property: "og:title", content: "Renpy archives extractor" },
    { property: "og:description", content: "Hassle free RPA extractor. In-Browser, no code, no exes." },
    { property: "og:image", content: "/preview.png" },
    { property: "og:url", content: "/" },
    { property: "og:type", content: "website" },
    { name: "theme-color", content: "#000000" },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Remix</h1>
      <ul className="list-disc mt-4 pl-6 space-y-2">
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/quickstart"
            rel="noreferrer"
          >
            5m Quick Start
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/tutorial"
            rel="noreferrer"
          >
            30m Tutorial
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/docs"
            rel="noreferrer"
          >
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
