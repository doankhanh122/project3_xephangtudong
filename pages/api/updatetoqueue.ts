import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "../../lib/dbconnection";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const enrolltime = new Date(Date.now())
  const body = req.body;
  // (SELECT count(customers_customerid) FROM project3.queues_has_customers where queues_queueid = ?);

  dbConnection.connect((error: any) => {
    if (error) throw error;
    console.log("Da ket noi database!");
    // (queues_queueid, customers_customerid, enrolltime, order, enrollstatus_enrollstatusid)

    dbConnection.query(
      `UPDATE queues_has_customers set enrolltime = ?, enrollstatus_enrollstatusid = ? where queues_queueid='${body.queueid}' and customers_customerid='${body.customerid}'`,
      [
        enrolltime,
        body.status
      ],
      (err: any, results: any, fields: any) => {
        if (err) {
        //   if (err.code == 'ER_DUP_ENTRY') {
        //     res.status(200).json({code: 'Duplicate', message: "Đang trong hàng đợi"})
        //   }
          res.status(200).json({code: 'Fail', message: err});

        }

        res.status(200).json({code: 'Success', message: "Đã thêm customer vào queue"});
      }
    );
  });

}

