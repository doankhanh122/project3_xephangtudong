import { NextApiRequest, NextApiResponse } from "next";
import { useCookies } from "react-cookie";
import { dbConnection } from "../../components/dbconnection";
import { parseCookies } from "../../helpers";




const md5 = require('md5')





export default async function insertCustomer(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const cookie = parseCookies(req)
    console.log(cookie.deviceInfo)

    const customerId = md5(cookie.deviceInfo)

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
      "INSERT INTO customers (customerid, name, deviceinfomation) values (?,?,?)",
      [
        customerId,
        'Anonymous',
        cookie.deviceInfo
      ],
      (err: any, results: any, fields: any) => {
        if (err) {
          res.status(401).json("Khong the luu thong tin vao Db \n" + err);
          throw err;
        }

        res.status(200).json("Da luu thong tin Customer");
      }
    );
  });
}

