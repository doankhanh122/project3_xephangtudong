import { NextApiRequest, NextApiResponse } from "next";
import { dbConnection } from "../../components/dbconnection";
import { parseCookies } from "../../helpers";




const md5 = require('md5')





export default async function insertCustomerToQueue(
  req: NextApiRequest,
  res: NextApiResponse
) {


  const enrolltime = new Date(Date.now())

  console.log("Request: ");
  console.log(req.body);

  const body = req.body;
  console.log("Body: ");
  console.log(body.queueid);


  dbConnection.connect((error: any) => {
    if (error) throw error;
    console.log("Da ket noi database!");
    // (queues_queueid, customers_customerid, enrolltime, order, enrollstatus_enrollstatusid)

    dbConnection.query(
      "INSERT INTO queues_has_customers values (?,?,?,?,?)",
      [
        body.queueid,
        body.customerid,
        enrolltime,
        body.order,
        body.status
        // body.queueid,
        // body.customerid,
        // enrolltime,
        // 1,
        // body.status
      ],
      (err: any, results: any, fields: any) => {
        if (err) {
          if (err.code == 'ER_DUP_ENTRY') {
            res.status(200).json({code: 'Duplicate', message: "Đang trong hàng đợi"})
          }
          res.status(401).json({code: 'Fail', message: err});
          console.log(err)
          throw err;
        }

        res.status(200).json({code: 'Success', message: "Đã thêm customer vào queue"});
      }
    );
  });

}

