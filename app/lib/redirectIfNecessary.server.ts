import { redirect } from "remix";
import getCurrentUser from "~/lib/getCurrentUser.server";

const redirectIfNecessary = async (
  request: Request,
  authenticatedPage: boolean
) => {
  const user = await getCurrentUser(request);

  if (user && !authenticatedPage) {
    throw redirect("/home");
  }

  if (!user && authenticatedPage) {
    throw redirect("/");
  }
};

export default redirectIfNecessary;
