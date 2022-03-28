import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";
import { NextApiResponseServerIO } from "../../types/next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
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

  res?.socket?.server?.io?.emit("queueid", body.queueid);

  res.json(inserttoqueue);

  db.$disconnect();
}
