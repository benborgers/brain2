import prisma from "~/lib/prisma.server";
import { getSession } from "~/lib/sessions.server";

const getCurrentUser = async (request: Request) => {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.get("userId")) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.get("userId") },
  });

  return user;
};

export default getCurrentUser;
