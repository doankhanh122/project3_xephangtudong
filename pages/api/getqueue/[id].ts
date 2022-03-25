import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queue = await db.queue.findUnique({
    where: {
      QueueID: req.query.id?.toString(),
    },
  });

  res.json(queue);
  db.$disconnect;
}
