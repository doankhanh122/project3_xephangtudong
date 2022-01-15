import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  const enrolltime = new Date(Date.now());
  // const queue_has_customer_data = JSON.parse(req.body);
  const inserttoqueue = await db.queue_has_customer.update({
    where: {
      queue_QueueID_customer_CustomerID: {
        queue_QueueID: body.queueid,
        customer_CustomerID: body.customerid,
      },
    },
    data: {
      enrollstatus_EnrollStatusID: 0,
      EnrollTime: enrolltime,
    },
  });
  res.json(inserttoqueue);
}
