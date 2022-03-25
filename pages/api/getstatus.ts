import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const enrollstatus = await db.enrollstatus.findMany();

  res.json(enrollstatus);

  db.$disconnect;
}
