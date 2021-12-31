import { ActionFunction, redirect } from "remix";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await getCurrentUserId(request);
  const body = await request.formData();

  switch (request.method) {
    case "POST": {
      await prisma.notecard.updateMany({
        where: {
          id: params.id,
          user: { id: userId },
        },
        data: {
          title: ((body.get("title") as string) || "").trim(),
          body: ((body.get("body") as string) || "").trim(),
        },
      });

      return null;
    }
    case "DELETE": {
      await prisma.notecard.updateMany({
        where: {
          id: params.id,
          user: { id: userId },
        },
        data: {
          deleted: true,
        },
      });

      return redirect("/home");
    }
  }
};
