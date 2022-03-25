import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  const insertcustomer = await db.customer.create({
    data: {
      CustomerID: body.customerid,
      Name: "Anonymous",
      DeviceInfomation: body.deviceinfo,
    },
  });

  res.json(insertcustomer);
  db.$disconnect;
}
