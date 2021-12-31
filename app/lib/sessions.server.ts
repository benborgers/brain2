import { createCookieSessionStorage } from "remix";
import { DateTime } from "luxon";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "brain2-session",
      expires: DateTime.now().plus({ years: 1 }).toJSDate(),
      httpOnly: true,
      sameSite: "lax",
      secrets: [process.env.APP_KEY as string],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
