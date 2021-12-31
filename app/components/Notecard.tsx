import React, { useState, useEffect, useRef, MouseEventHandler } from "react";
import { Form, useFetcher } from "remix";
import { CheckIcon, PencilIcon } from "@heroicons/react/outline";
import NotecardType from "~/types/Notecard";

type Props = {
  notecard: NotecardType;
};

const Notecard: React.FC<Props> = ({ notecard }) => {
  const [editing, setEditing] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      if (body) {
        bodyRef.current?.focus();
        // Set cursor to end.
        bodyRef.current?.setSelectionRange(
          bodyRef.current.value.length,
          bodyRef.current.value.length
        );
      } else {
        titleRef.current?.focus();
      }
    }
  }, [editing]);

  const resize = () => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "5px";
      bodyRef.current.style.height = bodyRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (editing) resize();
  }, [editing]);

  const [title, setTitle] = useState(notecard.title || "");
  const [body, setBody] = useState(notecard.body || "");

  const fetcher = useFetcher();
  const firstRun = useRef(true);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }

    syncTimeout.current = setTimeout(() => {
      fetcher.submit(
        { title, body },
        { method: "post", action: `/notecards/${notecard.id}` }
      );
    }, 500);
  }, [title, body]);

  const [deleted, setDeleted] = useState(notecard.deleted);

  if (deleted) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl border border-zinc-200 p-4">
      {editing ? (
        <>
          <div className="flex items-center justify-between gap-x-4">
            <input
              placeholder="Untitled"
              type="text"
              required
              className="w-full p-0 border-none focus:ring-0 font-semibold text-xl text-zinc-900 placeholder:text-zinc-400"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <StateButton onClick={() => setEditing(false)}>
              <CheckIcon className="h-3.5 w-3.5" />
            </StateButton>
          </div>

          <textarea
            placeholder="Type notes in markdown..."
            className="mt-2.5 font-mono w-full p-0 border-none focus:ring-0 placeholder:text-zinc-400 resize-none"
            ref={bodyRef}
            value={body}
            onChange={(e) => {
              resize();
              setBody(e.target.value);
            }}
          />

          <div className="mt-4">
            <Form
              method="delete"
              action={`/notecards/${notecard.id}`}
              replace
              onSubmit={() => setDeleted(true)}
            >
              <button className="text-rose-600">
                <span className="text-sm font-semibold">Send to Junk</span>
              </button>
            </Form>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-x-4">
            <h1 className="font-semibold text-xl text-zinc-900">
              {title || "Untitled"}
            </h1>

            <StateButton onClick={() => setEditing(true)}>
              <PencilIcon className="h-3.5 w-3.5" />
            </StateButton>
          </div>

          {notecard.bodyHtml && (
            <div
              dangerouslySetInnerHTML={{ __html: notecard.bodyHtml }}
              className="mt-2 prose prose-zinc"
            />
          )}
        </>
      )}
    </section>
  );
};

const StateButton: React.FC<{ onClick: MouseEventHandler }> = ({
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors duration-200 p-1.5 rounded-full"
      tabIndex={-1}
    >
      {children}
    </button>
  );
};

export default Notecard;
