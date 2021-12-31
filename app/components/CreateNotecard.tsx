import { useEffect, useRef, useState } from "react";
import { PlusSmIcon } from "@heroicons/react/solid";
import { motion, AnimatePresence } from "framer-motion";
import Card from "~/components/Card";
import { Form } from "remix";

export default function CreateNotecard() {
  const [open, setOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    }
  }, [open]);

  const resize = () => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "5px";
      bodyRef.current.style.height = bodyRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (open) resize();
  }, [open]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="grid grid-cols-[max-content,1fr] items-center gap-x-1 bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg"
        >
          <PlusSmIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">New Card</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className=" overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
          >
            <Card>
              <Form method="post" action="/notecards/create">
                <input
                  name="title"
                  placeholder="Untitled"
                  type="text"
                  required
                  className="w-full p-0 border-none focus:ring-0 font-semibold text-lg text-zinc-900 placeholder:text-zinc-400"
                  ref={titleRef}
                />

                <textarea
                  name="body"
                  placeholder="Type notes in markdown..."
                  className="mt-2 font-mono w-full p-0 border-none focus:ring-0 placeholder:text-zinc-400 resize-none"
                  ref={bodyRef}
                  onChange={resize}
                />
              </Form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
