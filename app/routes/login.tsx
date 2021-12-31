import { LoaderFunction, redirect } from "remix";
import prisma from "~/lib/prisma.server";
import { DateTime } from "luxon";
import { getSession, commitSession } from "~/lib/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const search = new URLSearchParams(new URL(request.url).search);
  const token: string = search.get("token") || "";

  const user = await prisma.user.findFirst({
    where: { loginToken: token },
  });

  if (!user) {
    throw new Error("Invalid token");
  }

  if (
    user.loginTokenExpiresAt &&
    DateTime.now() > DateTime.fromJSDate(user.loginTokenExpiresAt)
  ) {
    throw new Error("Token expired, please log in again");
  }

  const session = await getSession(request.headers.get("cookie"));
  session.set("userId", user.id);

  /* We could wipe the login token once it's used once,
      but I suspect that people will click the link on
      the wrong device and need to use it again. */
  // await prisma.user.update({
  //   where: { id: user.id },
  //   data: { loginToken: null, loginTokenExpiresAt: null },
  // });

  return redirect("/~", {
    headers: {
      "set-cookie": await commitSession(session),
    },
  });
};

export default function () {
  return <div />;
}
