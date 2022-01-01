import { Link, redirect, json, useLoaderData } from "remix";
import type { LoaderFunction, ActionFunction } from "remix";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { TAG_REGEX } from "~/constants";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";
import markdown from "~/lib/markdown.server";
import Notecard from "~/components/Notecard";
import NotecardType from "~/types/Notecard";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getCurrentUserId(request);
  const notecard: NotecardType = await prisma.notecard.findFirst({
    where: {
      id: params.id,
      user: { id: userId },
      deleted: false,
    },
  });

  if (!notecard) {
    throw new Response("", { status: 404 });
  }

  notecard.bodyHtml = markdown(notecard.body || "");

  return json({ notecard });
};

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

export default function () {
  const data = useLoaderData();

  return (
    <>
      <div>
        <Link
          to="/home"
          prefetch="intent"
          className="block max-w-max bg-zinc-200 p-1 rounded-full"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8" />

      <Notecard notecard={data.notecard} />
    </>
  );
}
