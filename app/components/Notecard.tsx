import React, { useState, useEffect, useRef, MouseEventHandler } from "react";
import { Link, Form, useFetcher, useNavigate } from "remix";
import tinykeys from "tinykeys";
import { CheckIcon, PencilIcon } from "@heroicons/react/outline";
import NotecardType from "~/types/Notecard";

// For some reason, just using a prop doesn't work within the
// tinykeys callback, so I'm using this hack.
let globalActiveId: string | null;

type Props = {
  notecard: NotecardType;
  activeId?: string | null;
};

const Notecard: React.FC<Props> = ({ notecard, activeId = null }) => {
  /* EDITING/VIEWING MODE */
  const [editing, setEditing] = useState(() => {
    // Editing mode by default on fresh notecards.
    if (!notecard.title && !notecard.body) {
      return true;
    }

    return false;
  });

  /* INPUTS: FOCUS AND RESIZING */

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const focusBody = () => {
    bodyRef.current?.focus();
    // Set cursor to end.
    bodyRef.current?.setSelectionRange(
      bodyRef.current.value.length,
      bodyRef.current.value.length
    );
  };

  useEffect(() => {
    if (editing) {
      if (!title) {
        titleRef.current?.focus();
      } else {
        focusBody();
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

  /* TAGS */

  const navigate = useNavigate();
  const bodyHtmlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing && bodyHtmlRef.current) {
      bodyHtmlRef.current.querySelectorAll("[data-tag]").forEach((tag) => {
        tag.classList.add("bg-amber-100", "text-zinc-900", "cursor-pointer");
        tag.addEventListener("click", () => {
          navigate(`?tag=${(tag as HTMLElement).dataset.tag}`);
        });
      });
    }
  }, [editing, notecard.bodyHtml]);

  /* WRITING DATA TO THE SERVER */

  const [title, setTitle] = useState(notecard.title || "");
  const [body, setBody] = useState(notecard.body || "");
  // When navigating from one /notecard/$id page to another,
  // the ID doesn't get updated because the underlying component
  //  stays the same (I think?). This makes sure it updates.
  useEffect(() => {
    setTitle(notecard.title || "");
    setBody(notecard.body || "");
  }, [notecard.id]);

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

  /* KEYBOARD SHORTCUTS */

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+E": () => {
        if (!globalActiveId) {
          setEditing(true);
        } else if (globalActiveId === notecard.id) {
          setEditing(true);
        }
      },
      "$mod+Enter": () => {
        setEditing(false);
      },
      escape: () => {
        setEditing(false);
      },
    });

    return unsubscribe;
  }, []);

  globalActiveId = activeId;

  /* DELETING THIS NOTECARD */

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Timeout so the enter key isn't double counted as a newline in the body.
                  setTimeout(focusBody);
                }
              }}
            />

            <StateButton onClick={() => setEditing(false)}>
              <CheckIcon className="h-3.5 w-3.5" />
            </StateButton>
          </div>

          <textarea
            placeholder="Type notes in markdown..."
            className="h-6 mt-2.5 font-mono w-full p-0 border-none focus:ring-0 placeholder:text-zinc-400 resize-none"
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
            <Link to={`/notecards/${notecard.id}`} prefetch="intent">
              <h1 className="font-semibold text-xl text-zinc-900">
                {title || "Untitled"}
              </h1>
            </Link>

            <StateButton onClick={() => setEditing(true)}>
              <PencilIcon className="h-3.5 w-3.5" />
            </StateButton>
          </div>

          {notecard.bodyHtml && (
            <div
              dangerouslySetInnerHTML={{ __html: notecard.bodyHtml }}
              className="mt-2 prose prose-zinc overflow-hidden"
              ref={bodyHtmlRef}
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
