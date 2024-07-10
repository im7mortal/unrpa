import type {LinksFunction, MetaFunction} from "@remix-run/node";
import App from "~/routes/unrpa/App";
import React from "react";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/navbar-logo.png" },
    { rel: "manifest", href: "/manifest.json" },
  ];
};

export const meta: MetaFunction = () => {
  return [
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
      <App />
  );
}
