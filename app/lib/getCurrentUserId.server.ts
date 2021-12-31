import { getSession } from "~/lib/sessions.server";
import { User } from "@prisma/client";

const getCurrentUserId = async (request: Request): Promise<User> => {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.get("userId")) {
    throw new Error("Unauthenticated");
  }

  return session.get("userId");
};

export default getCurrentUserId;
