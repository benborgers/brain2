type Email = {
  from_name: string;
  from_email: string;
  to: string;
  subject: string;
  body: string;
};

const sendEmail = async (email: Email): Promise<void> => {
  await fetch("https://friede.gg/api/mail", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: process.env.FRIEDEGG_TOKEN?.toString() || "",
    },
    body: JSON.stringify([email]),
  });
};

export default sendEmail;
