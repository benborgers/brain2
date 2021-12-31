import { useState, useEffect } from "react";
import { Form, json, LoaderFunction, useLoaderData } from "remix";
import type { ActionFunction } from "remix";
import { PlusSmIcon } from "@heroicons/react/solid";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";
import markdown from "~/lib/markdown.server";
import Notecard from "~/components/Notecard";
import NotecardType from "~/types/Notecard";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getCurrentUserId(request);
  const notecards: Array<NotecardType> = await prisma.notecard.findMany({
    where: {
      user: { id: userId },
    },
    orderBy: { updatedAt: "desc" },
  });

  notecards.forEach((notecard) => {
    notecard.bodyHtml = markdown(notecard.body || "");
  });

  return json({ notecards });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getCurrentUserId(request);
  await prisma.notecard.create({
    data: {
      user: {
        connect: { id: userId },
      },
    },
  });
  return null;
};

export default function Tilde() {
  const loaderData = useLoaderData();
  const [data, setData] = useState(loaderData);
  useEffect(() => setData(loaderData), [loaderData]);

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <Form method="post">
        <button className="grid grid-cols-[max-content,1fr] items-center gap-x-1 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg">
          <PlusSmIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">New Card</span>
        </button>
      </Form>

      <div className="mt-6 space-y-4">
        {data.notecards.map((notecard: NotecardType) => (
          <Notecard
            key={notecard.id}
            notecard={notecard}
            editing={editingId === notecard.id}
            setEditing={(editing) => {
              if (editing) {
                setEditingId(notecard.id);
              } else {
                setEditingId(null);
              }
            }}
          />
        ))}
      </div>
    </>
  );
}
