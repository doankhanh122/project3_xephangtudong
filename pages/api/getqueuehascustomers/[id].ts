import { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/dbconnection";

export default async function getQueueHasCustomers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queue_has_customer = await db.queue_has_customer.findMany({
    where: {
      OR: [
        {
          queue_QueueID: req.query.id?.toString(),
        },
        { customer_CustomerID: req.query.id?.toString() },
      ],
    },

    orderBy: [
      {
        EnrollTime: "desc",
      },
    ],
  });

  res.json(queue_has_customer);
}
