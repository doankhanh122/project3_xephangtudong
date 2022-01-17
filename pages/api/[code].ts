import { NextApiRequest, NextApiResponse } from "next";
import { redirect } from "next/dist/server/api-utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  //   const insertcustomer = await db.customer.create({
  //     data: {
  //       CustomerID: body.customerid,
  //       Name: "Anonymous",
  //       DeviceInfomation: body.deviceinfo,
  //     },
  //   });

  console.log(req.query.code);

  res.redirect(`/`);
}
