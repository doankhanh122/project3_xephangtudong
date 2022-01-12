import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.query.queuecode);
  const queues = await db.queue.findMany();
  res.json(queues);
}
