import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import { dbConnection } from "../../../lib/dbconnection";
// const {query} = useRouter();

export default async function getQueueHasCustomers(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    
    // console.log(req)
    dbConnection.connect((error: any) => {
      if (error) throw error;
      console.log("Da ket noi database!");
      dbConnection.query(
        "Select * from queues_has_customers where queues_queueid = ? or customers_customerid = ?",
        [req.query.id, req.query.id],
        (err: any, results: any, fields: any) => {
          if (err) throw err;
          res.status(200).json(results);
        }
      );
    });
  }