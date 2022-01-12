import { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/dbconnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const effectFrom = new Date(Date.now());
  // const effectTo = new Date(Date.now() + 600000);

  const queueData = JSON.parse(req.body);

  const insertqueue = await db.queue.create({ data: queueData });
  res.json(insertqueue);

  // "INSERT INTO queues (queueid, effectfrom, effectto, author, place, edition, code) values (?,?,?,?,?,?,?)",
  //     [
  //       body.queueId,
  //       effectFrom,
  //       effectTo,
  //       body.author,
  //       body.place,
  //       body.edition,
  //       body.code,
  //     ],
}
