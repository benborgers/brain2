import { useState, useEffect, useRef } from "react";
import {
  Form,
  json,
  useLoaderData,
  useActionData,
  useTransition,
  Link,
} from "remix";
import type { LoaderFunction, ActionFunction } from "remix";
import { AnimatePresence, motion } from "framer-motion";
import tinykeys from "tinykeys";
import { PlusSmIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import getCurrentUserId from "~/lib/getCurrentUserId.server";
import prisma from "~/lib/prisma.server";
import markdown from "~/lib/markdown.server";
import NotecardType from "~/types/Notecard";
import Notecard from "~/components/Notecard";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getCurrentUserId(request);

  const searchParams = new URLSearchParams(new URL(request.url).search);
  const tag = searchParams.get("tag");

  const notecards: Array<NotecardType> = await prisma.notecard.findMany({
    where: {
      ...{
        user: { id: userId },
        deleted: false,
      },
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  notecards.forEach((notecard) => {
    notecard.bodyHtml = markdown(notecard.body || "");
  });

  return json({ notecards, tag });
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
      setActiveId(actionData.createdNotecard.id);
    }
  }, [actionData]);

  const transition = useTransition();

  const [activeId, setActiveId] = useState<string | null>(null);

  /* KEYBOARD SHORTCUTS */

  const newCardRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "Shift+N": () => {
        newCardRef.current?.click();
      },
    });

    return unsubscribe;
  });

  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <AnimatePresence>
            {data.tag && (
              <motion.div
                className="flex items-center gap-x-4"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ type: "spring", duration: 0.2 }}
              >
                <Link
                  to="/home"
                  prefetch="intent"
                  className="block bg-zinc-200 p-1 rounded-full"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                <p className="text-xl font-bold text-zinc-900">
                  <span className="text-rose-500 mr-0.5">#</span>
                  {data.tag}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Form method="post">
          <input name="_action" value="create" type="hidden" />
          <button
            className="grid grid-cols-[max-content,1fr] items-center gap-x-1 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg"
            ref={newCardRef}
          >
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
      </div>

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
              onMouseEnter={() => setActiveId(notecard.id)}
            >
              <Notecard notecard={notecard} activeId={activeId} />
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
