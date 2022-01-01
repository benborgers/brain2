import { LoaderFunction, LinksFunction, Outlet } from "remix";
import redirectIfNecessary from "~/lib/redirectIfNecessary.server";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/katex@0.15.1/dist/katex.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  await redirectIfNecessary(request, true);
  return null;
};

export default function AppLayout() {
  return (
    <div className="max-w-screen-sm mx-auto sm:mt-4">
      <Outlet />
    </div>
  );
}
