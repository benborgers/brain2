import { redirect } from "remix";
import { getSession } from "./sessions.server";

const redirectIfNecessary = async (
  request: Request,
  authenticatedPage: boolean
) => {
  const session = await getSession(request.headers.get("cookie"));
  const userId = session.get("userId");

  if (userId && !authenticatedPage) {
    throw redirect("/home");
  }

  if (!userId && authenticatedPage) {
    throw redirect("/");
  }
};

export default redirectIfNecessary;
