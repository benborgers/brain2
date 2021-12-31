import { Notecard as PrismaNotecard } from "@prisma/client";

type Notecard = PrismaNotecard & {
  bodyHtml?: string;
};

export default Notecard;
