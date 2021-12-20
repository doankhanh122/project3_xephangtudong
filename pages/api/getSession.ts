import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "./dbconnection";

const sqlQuerry = "Select key from sessions";
export default async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  dbConnection.connect((error: any) => {
    if (error) throw error;
    console.log("Da ket noi database!");
    dbConnection.query(
      "Select * from enrollstatus",
      (err: any, results: any, fields: any) => {
        if (err) throw err;
        res.status(200).json(results);
      }
    );
  });
}
