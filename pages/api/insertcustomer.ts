import { NextApiRequest, NextApiResponse } from "next";
import { useCookies } from "react-cookie";
import { dbConnection } from "../../components/dbconnection";
import { parseCookies } from "../../helpers";




const md5 = require('md5')



export default async function insertCustomer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise((resolve) => {
    console.log("Request: ");
    console.log(req.body);
  
    const body = req.body;
    console.log(body);
    console.log(body.code);
  
    dbConnection.connect((error: any) => {
      if (error) throw error;
      console.log("Da ket noi database!");
  
      dbConnection.query(
        "INSERT INTO customers (customerid, name, deviceinfomation) values (?,?,?)",
        [
          body.customerid,
          'Anonymous',
          body.deviceinfo
        ],
        (err: any, results: any, fields: any) => {
          if (err) {
  
            if (err.code == 'ER_DUP_ENTRY') {
              res.status(200).json({code: 'Duplicate', message: 'Customerid đã có trong Db'});
            }
            res.status(401).json({code: 'Fail', message:err});
            
            throw err;
          }
  
          res.status(200).json({code: 'Success', message: 'Customerid đã được thêm thành công'});
         
        }
      );
    });

    resolve(res)


  })

    
    

    // const cookie = parseCookies(req)
    // console.log(cookie.deviceInfo)

    // const customerId = md5(cookie.deviceInfo)

  
}

