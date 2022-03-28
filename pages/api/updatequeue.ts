import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  // const enrolltime = new Date(Date.now());
  // const queue_has_customer_data = JSON.parse(req.body);
  const updateCustomerHasQueue = await db.queue.update({
    where: {
      QueueID: body.queueid,
    },
    data: {
      Code: body.code,
    },
  });

  res.json(updateCustomerHasQueue);
  db.$disconnect();
}
