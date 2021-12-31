import { useState, useEffect } from "react";
import { Form, json, useLoaderData, useActionData, useTransition } from "remix";
import type { LoaderFunction, ActionFunction } from "remix";
import { PlusSmIcon } from "@heroicons/react/solid";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";
import markdown from "~/lib/markdown.server";
import Notecard from "~/components/Notecard";
import NotecardType from "~/types/Notecard";
import { motion } from "framer-motion";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getCurrentUserId(request);
  const notecards: Array<NotecardType> = await prisma.notecard.findMany({
    where: {
      user: { id: userId },
      deleted: false,
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
  const createdNotecard = await prisma.notecard.create({
    data: {
      user: {
        connect: { id: userId },
      },
    },
  });
  return json({ createdNotecard });
};

export default function Home() {
  const loaderData = useLoaderData();
  const [data, setData] = useState(loaderData);
  useEffect(() => setData(loaderData), [loaderData]);

  // We keep track of the order separately, so the notecards
  // don't reorder themselves as we type.
  const [order, setOrder] = useState<Array<string>>(
    data.notecards.map((notecard: NotecardType) => notecard.id)
  );

  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.createdNotecard) {
      const clone = [actionData.createdNotecard.id, ...order];
      setOrder(clone);
    }
  }, [actionData]);

  const transition = useTransition();

  return (
    <>
      <Form method="post">
        <input name="_action" value="create" type="hidden" />
        <button className="grid grid-cols-[max-content,1fr] items-center gap-x-1 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg">
          {transition.state === "submitting" &&
          transition?.submission.formData.get("_action") === "create" ? (
            <span className="text-sm font-semibold">Loading...</span>
          ) : (
            <>
              <PlusSmIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">New Card</span>
            </>
          )}
        </button>
      </Form>

      <div className="mt-6 space-y-4">
        {order.map((id) => {
          const notecard: NotecardType = data.notecards.find(
            (n: NotecardType) => n.id === id
          );

          if (!notecard) {
            return null;
          }

          return (
            <motion.div
              layout
              transition={{ type: "spring", duration: 0.4 }}
              key={notecard.id}
              onClick={() => console.log("active notecard", notecard)}
            >
              <Notecard notecard={notecard} />
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
