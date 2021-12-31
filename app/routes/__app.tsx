import { LoaderFunction, Outlet } from "remix";
import redirectIfNecessary from "~/lib/redirectIfNecessary.server";

export const loader: LoaderFunction = async ({ request }) => {
  await redirectIfNecessary(request, true);
  return null;
};

export default function AppLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
