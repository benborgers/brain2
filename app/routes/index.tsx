import { useState, useEffect } from "react";
import { Form, LoaderFunction, redirect, useTransition } from "remix";
import type { ActionFunction } from "remix";
import prisma from "~/lib/prisma.server";
import { DateTime } from "luxon";
import sendEmail from "~/lib/sendEmail.server";
import redirectIfNecessary from "~/lib/redirectIfNecessary.server";

export const loader: LoaderFunction = async ({ request }) => {
  await redirectIfNecessary(request, false);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const email = (body.get("email")?.toString() || "").toLowerCase().trim();

  if (!email) throw new Error("Email is required");

  const token = Math.random().toString().slice(2);
  const tokenExpiry = DateTime.now().plus({ minutes: 30 });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        loginToken: token,
        loginTokenExpiresAt: tokenExpiry.toISO(),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        loginToken: token,
        loginTokenExpiresAt: tokenExpiry.toISO(),
      },
    });
  }

  sendEmail({
    from_name: "Brain",
    from_email: "brain",
    to: email,
    subject: "Log in to your Brain account",
    body: `Click this link to log in to your Brain account: https://brain.elk.sh/login?token=${token}`,
  });

  return redirect("/");
};

export default function Index() {
  const [sent, setSent] = useState(false);

  const transition = useTransition();

  useEffect(() => {
    if (transition.state === "submitting") {
      setSent(true);
    }
  }, [transition.state]);

  return (
    <div className="mt-[30vh] mx-auto w-64">
      <h1 className="font-semibold text-xl text-zinc-900">Log in to Brain</h1>

      <div className="mt-4">
        {sent ? (
          <p className="text-zinc-500">Link sent! Check your email.</p>
        ) : (
          <Form method="post" className="gap-4 space-y-4">
            <input
              name="email"
              type="email"
              placeholder="email address"
              required
              autoFocus
              className="block w-full rounded-full px-4
                border-zinc-200 focus:border-rose-500 focus:ring-rose-500 transition-colors duration-200
                placeholder:text-zinc-500 text-zinc-900"
            />
            <button className="block px-4 py-2 bg-rose-100 text-rose-600 rounded-full font-medium">
              Send login link
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
