import { ActionFunction, redirect } from "remix";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";
import { TAG_REGEX } from "~/constants";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await getCurrentUserId(request);
  const formData = await request.formData();

  switch (request.method) {
    case "POST": {
      const title = ((formData.get("title") as string) || "").trim();
      const body = ((formData.get("body") as string) || "").trim();
      const tags = (body.match(TAG_REGEX) || []).map((t) => t.slice(1));

      await prisma.notecard.updateMany({
        where: {
          id: params.id,
          user: { id: userId },
        },
        data: { title, body, tags },
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
