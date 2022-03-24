import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const enrolltime = new Date(Date.now());
  const body = req.body;

  // const inserttoqueue = await db.queue_has_customer.create({
  //   data: body,
  // });

  console.log(body);

  const inserttoqueue = await db.queue_has_customer.create({
    data: {
      queue_QueueID: body.queueid,
      customer_CustomerID: body.customerid,
      EnrollTime: enrolltime,
      Order: body.order,
      enrollstatus_EnrollStatusID: body.status,
    },
  });
  db.$disconnect();
  res.json(inserttoqueue);
}
