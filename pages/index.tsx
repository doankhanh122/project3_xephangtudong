import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Warning from "../components/warning";
import { useCookies } from "react-cookie";

// import QrReader from 'react-qr-reader'
import dynamic from "next/dynamic";
import { AnyCnameRecord } from "dns";
import GetNumberDialog from "../components/getNumberDialog";
import CustomerQueues from "../components/customerQueues";
import { useQueueHasCustomers } from "../lib/swr-hooks";

const QrReader: any = dynamic(() => import("react-qr-reader"), { ssr: false });
const md5 = require("md5");

// function getTime(date: Date) {
//   return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
// }

export type RequestResponse = {
  code: string;
  message: string;
};

export type Customer = {
  id: number;
  name: string;
  time: string;
};

export type Queue = {
  QueueID: number;
  EffectFrom: Date;
  EffectTo: Date;
  Author: string;
  Place: string;
  Edition: string;
  Code: string;
};

export type QueueHasCustomers = {
  queues_QueueID: number;
  customers_CustomerID: string;
  EnrollTime: Date;
  Order: number;
  enrollstatus_EnrollStatusID: number;
};

const Home: NextPage<{
  app_url: string;
  device_info: string;
  queues: Queue[];
}> = ({ app_url, device_info, queues }) => {
  // console.log("Customer Queue \n" + customerQueues[0].customers_CustomerID);
  const [customerQueue, setCustomerQueue] = useState<Queue>();
  const [queueHasCustomers, setQueueHasCustomers] =
    useState<QueueHasCustomers[]>();

  const [cookie, setCookie] = useCookies(["deviceInfo", "customerId"]);
  setCookie("deviceInfo", device_info);

  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState(false);
  const [dataQr, setDataQr] = useState(null);

  const handleScan = async (data: any) => {
    setDataQr(data);

    if (data != null && isCameraTurnedOn) {
      const deviceinfo = cookie.deviceInfo;
      setIsCameraTurnedOn(false);

      // console.log("Customer ID cookie: " + cookie.customerid);
      const queue = getQueueWithCode(data, queues);
      console.log(queue);
      if (queue !== undefined) {
        setCustomerQueue(queue);
      } else {
        setCustomerQueue(undefined);
      }
    }
  };

  const handleError = (err: AnyCnameRecord) => {
    console.error(err);
  };

  const insertCustomerToQueueHandler = async () => {
    const customerid_cookie = cookie.customerId;
    const deviceInfo = cookie.deviceInfo;
    const customerId = md5(deviceInfo);
    if (customerid_cookie === undefined) {
      const registerCustomerRes = await registerCustomer(app_url, deviceInfo);

      if (registerCustomerRes.code === "Success") {
        setCookie("customerId", customerId);

        // Add to Queue
        if (customerQueue !== undefined) {
          const addCustomerToQueueRes = await addCustomerToQueue(
            app_url,
            customerQueue.QueueID.toString(),
            customerId,
            "0",
            "0"
          );

          if (addCustomerToQueueRes.code === "Success") {
          }
        }
      }
    } else {
      // CustomerID da luu trong cookie

      // Add to Queue
      if (customerQueue !== undefined) {
        const addCustomerToQueueRes = await addCustomerToQueue(
          app_url,
          customerQueue.QueueID.toString(),
          customerId,
          "0",
          "0"
        );

        if (addCustomerToQueueRes.code === "Success") {
        } else if (addCustomerToQueueRes.code === "Duplicate") {
          console.log("Duplicate");
        }
      }
    }
  };

  const getQueueHasCustomers = useCallback(async () => {
    const customerQueues = await fetch(
      app_url + `/api/getqueuehascustomers/${cookie.customerId}`
    ).then((res) => res.json());

    setQueueHasCustomers(customerQueues);
  }, []);

  useEffect(() => {
    getQueueHasCustomers();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Project 3</title>
        <meta name="description" content="Hỗ trợ khách hàng lấy số thứ tự" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section>
          <h3 className={styles.title}>Lấy số thứ tự</h3>
          <div className={styles.description}>
            <label>Quét mã QR để lấy số thứ tự </label>

            <p></p>

            {isCameraTurnedOn && (
              <div className="card">
                <QrReader
                  delay={300}
                  style={{ height: 240, width: 240, margin: "auto" }}
                  onError={handleError}
                  onScan={handleScan}
                  legacyMode={false}
                />
              </div>
            )}
            <button
              className="btn btn-success"
              onClick={() => {
                setIsCameraTurnedOn((isCameraTurnedOn) => !isCameraTurnedOn);
              }}
            >
              {isCameraTurnedOn ? "Dừng quét" : "Quét ngay"}
            </button>
            {dataQr !== null && customerQueue != undefined && (
              <GetNumberDialog
                queue={customerQueue}
                insertCustomerToQueue={insertCustomerToQueueHandler}
              />
            )}

            {customerQueue == undefined && dataQr != null && (
              <div className="alert alert-danger mt-3">Mã QR không đúng</div>
            )}
          </div>
        </section>
        <br />

        <section>
          {queues.length > 0 &&
            queueHasCustomers &&
            queueHasCustomers.length > 0 && (
              <CustomerQueues
                queues={queues}
                queuehascustomers={queueHasCustomers || []}
              />
            )}

          <ul>
            {/* {queueHasCustomers &&
              queueHasCustomers.map((row) => {
                return (
                  <li key={row.queues_QueueID + row.customers_CustomerID}>
                    {row.queues_QueueID}
                  </li>
                );
              })} */}
          </ul>
        </section>

        <section>
          <h3 className={styles.title}>Danh sách Địa điểm</h3>
          <ul>
            {queues.map((queue) => {
              return <li key={queue.QueueID}>{queue.Place}</li>;
            })}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Giảng viên hướng dẫn: Thầy Nguyễn Đức Tiến
        </a>
      </footer>
    </div>
  );
};

Home.getInitialProps = async ({
  req,
  res,
}): Promise<{
  app_url: string;
  device_info: string;
  queues: Queue[];
}> => {
  const device_info = req?.headers["user-agent"] || navigator.userAgent;
  const app_url = process.env.APP_URL || "";
  const queues: Queue[] = await fetch(app_url + "/api/getqueue").then(
    (queues) => queues.json()
  );

  return { app_url, device_info, queues };
};

export default Home;

const registerCustomer = async (
  app_url: string,
  deviceinfo: string
): Promise<RequestResponse> => {
  const url = `${app_url}/api/insertcustomer`;

  const res: RequestResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerid: md5(deviceinfo), deviceinfo }),
  }).then((res) => res.json());

  return res;
};

const addCustomerToQueue = async (
  app_url: string,
  queueid: string,
  customerid: string,
  order: string,
  status: string
): Promise<RequestResponse> => {
  const url = app_url + "/api/inserttoqueue";
  const res: RequestResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queueid,
      customerid,
      order,
      status,
    }),
  }).then((res) => res.json());

  return res;
};

const getQueueWithCode = (queueCode: string, queues: Queue[]) => {
  let result: Queue | undefined;
  queues.forEach((queue: Queue) => {
    if (queue.Code == queueCode) {
      result = queue;
    }
  });

  return result;
};
