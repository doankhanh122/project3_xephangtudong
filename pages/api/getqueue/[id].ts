import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "../../../lib/dbconnection";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    dbConnection.connect((error: any) => {
      if (error) throw error;
      console.log("Da ket noi database!");
      dbConnection.query(
        "Select * from queues where queueid = ?", [req.query.id],
        (err: any, results: any, fields: any) => {
          if (err) throw err;
          res.status(200).json(results);
        }
      );
    });
  }