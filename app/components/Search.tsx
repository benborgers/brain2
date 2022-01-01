import { useState, useEffect, useRef, Fragment } from "react";
import { Link, useFetcher, useNavigate, useLocation } from "remix";
import { Dialog, Transition } from "@headlessui/react";
import tinykeys from "tinykeys";
import NotecardType from "~/types/Notecard";

export default function Search() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+K": () => setOpen(true),
      ArrowDown: () => {
        if (!open) return;
        for (let i = 0; i < results.length; i++) {
          if (results[i].id === activeId) {
            setActiveId(results[i + 1]?.id || results[0]?.id);
            break;
          }
        }
      },
      ArrowUp: () => {
        if (!open) return;
        for (let i = 0; i < results.length; i++) {
          if (results[i].id === activeId) {
            setActiveId(results[i - 1]?.id || results[results.length - 1]?.id);
            break;
          }
        }
      },
      Enter: () => {
        if (!open) return;
        if (activeId) {
          navigate(`/notecards/${activeId}`);
        }
      },
    });

    return unsubscribe;
  });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<NotecardType>>([]);

  const fetcher = useFetcher();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setActiveId(null);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetcher.load(`/search?query=${query}`);
    }, 200);
  }, [query]);

  // When new data loads, set the active result to the first result.
  useEffect(() => {
    if (fetcher.data) {
      setResults(fetcher.data);
      setActiveId(fetcher.data[0]?.id);
    }
  }, [fetcher.data]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // When we go to another page by navigating to a result, close the modal.
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);

  // When the modal closes, clear the query (but only after the
  // animation has finished, so we don't see it clear).
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
      }, 250);
    }
  }, [open]);

  // Scroll to the active result if it's not visible.
  useEffect(() => {
    if (!activeId) return;
    document.querySelector(`[data-result-id="${activeId}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeId]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 grid place-items-center pointer-events-none">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="bg-zinc-900 w-full max-w-xl rounded-xl shadow overflow-hidden pointer-events-auto">
              <div className="pt-4 px-4">
                <input
                  type="text"
                  placeholder="Search for something..."
                  className="block w-full p-0 bg-transparent border-none focus:ring-0 placeholder:text-zinc-500 text-white font-semibold text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div className="mt-3 border-t border-zinc-800 h-72 overflow-scroll">
                {results.map((notecard) => {
                  const isActive = activeId === notecard.id;
                  return (
                    <Link
                      to={`/notecards/${notecard.id}`}
                      prefetch={isActive ? "render" : "none"}
                      key={notecard.id}
                      className={`block py-2 px-4 ${
                        isActive ? "bg-zinc-800" : ""
                      }`}
                      // For scrolling to active result.
                      data-result-id={notecard.id}
                    >
                      <p className="text-zinc-300 text-lg">
                        {notecard.title || "Untitled"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
