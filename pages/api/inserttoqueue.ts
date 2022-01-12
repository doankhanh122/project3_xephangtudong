import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const enrolltime = new Date(Date.now());
  const body = req.body;
  const inserttoqueue = await prisma.queue_has_customer.create({
    data: {
      queue_QueueID: body.queueid,
      customer_CustomerID: body.customerid,
      EnrollTime: enrolltime,
      Order: body.order,
      enrollstatus_EnrollStatusID: body.status,
    },
  });

  res.json(inserttoqueue);
}
