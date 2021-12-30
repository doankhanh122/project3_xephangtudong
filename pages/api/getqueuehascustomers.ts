import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import { dbConnection } from "../../components/dbconnection";
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
        "Select * from queues_has_customers where queues_queueid = ?",
        req.query.queueid,
        (err: any, results: any, fields: any) => {
          if (err) throw err;
          res.status(200).json(results);
        }
      );
    });
  }