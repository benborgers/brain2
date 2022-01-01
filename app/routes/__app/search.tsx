import { json } from "remix";
import type { LoaderFunction } from "remix";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getCurrentUserId(request);
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const query = searchParams.get("query")?.trim();

  const results = await prisma.notecard.findMany({
    where: {
      user: { id: userId },
      deleted: false,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  return json(results);
};
