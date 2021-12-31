import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "../../components/dbconnection";

const sqlQuerry = "Select key from sessions";
export default async function insertQueue(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request: ");
  console.log(req.body);

  const body = req.body;
  console.log(body);
  console.log(body.code);

  const effectFrom = new Date(Date.now());
  const effectTo = new Date(Date.now() + 600000);

  dbConnection.connect((error: any) => {
    if (error) throw error;
    console.log("Da ket noi database!");

    dbConnection.query(
      "INSERT INTO queues (queueid, effectfrom, effectto, author, place, edition, code) values (?,?,?,?,?,?,?)",
      [
        body.queueId,
        effectFrom,
        effectTo,
        body.author,
        body.place,
        body.edition,
        body.code,
      ],
      (err: any, results: any, fields: any) => {
        if (err) {
          res.status(401).json({code:'Fail', message:"Khong the luu thong tin vao Db"});
          throw err;
        }

        res.status(200).json({code:'Success', message:"Da luu thong tin Queue"});
      }
    );
  });
}
