import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import { useCookies } from "react-cookie";

// import QrReader from 'react-qr-reader'
import dynamic from "next/dynamic";
import { AnyCnameRecord } from "dns";
import GetNumberDialog from "../components/getNumberDialog";
import CustomerQueues from "../components/customerQueues";
import { useQueueHasCustomers } from "../lib/swr-hooks";
import DuplicateWarning from "../components/duplicateWarning";
import { GetServerSideProps } from "next";
import { PrismaClient, queue, queue_has_customer } from "@prisma/client";
import db from "../lib/dbconnection";

const QrReader: any = dynamic(() => import("react-qr-reader"), { ssr: false });
const md5 = require("md5");

export type RequestResponse = {
  code: string;
  message: string;
};

const Home: NextPage<{
  app_url: string;
  device_info: string;
  queues_stringify: string;
}> = ({ app_url, device_info, queues_stringify }) => {
  // console.log("Customer Queue \n" + customerQueues[0].customers_CustomerID);
  const queues: queue[] = JSON.parse(queues_stringify);
  const [customerQueue, setCustomerQueue] = useState<queue>();
  const [cookie, setCookie] = useCookies(["customerId"]);

  const { queueHasCustomers, isLoading, isError } = useQueueHasCustomers(
    cookie.customerId
  );

  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState(false);
  const [dataQr, setDataQr] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [customerResult, setCustomerResult] = useState<queue_has_customer[]>();

  const handleScan = async (data: any) => {
    setDataQr(data);

    if (data != null && isCameraTurnedOn) {
      setIsCameraTurnedOn(false);

      // console.log("Customer ID cookie: " + cookie.customerid);
      const queue = getQueueWithCode(data, queues);
      // console.log(queue);
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
    const customerId = md5(device_info);
    if (customerid_cookie === undefined) {
      const registerCustomerRes = await registerCustomer(device_info);

      if (registerCustomerRes) {
        setCookie("customerId", customerId);

        // Add to Queue
        if (customerQueue !== undefined) {
          const addCustomerToQueueRes = await addCustomerToQueue(
            customerQueue.QueueID.toString(),
            customerId,
            1,
            0
          );

          if (addCustomerToQueueRes) {
            setIsSuccess(true);
          } else {
            setIsSuccess(false);
          }
        }
      }
    } else {
      // CustomerID da luu trong cookie

      // Add to Queue
      if (customerQueue !== undefined) {
        const addCustomerToQueueRes = await addCustomerToQueue(
          customerQueue.QueueID.toString(),
          customerId,
          1,
          0
        );

        if (addCustomerToQueueRes) {
          setIsSuccess(true);
        } else setIsSuccess(false);
      }
    }
  };

  const updateCustomerToQueueHandler = async () => {
    if (customerQueue !== undefined) {
      const res = await updateCustomerToQueue(
        customerQueue.QueueID.toString(),
        cookie.customerId,
        "0"
      );

      if (res) {
        setIsSuccess(true);
      }
    }
  };

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

            {isDuplicate && (
              <DuplicateWarning confirm={updateCustomerToQueueHandler} />
            )}

            {customerQueue == undefined && dataQr != null && (
              <div className="alert alert-danger mt-3">Mã QR không đúng</div>
            )}

            {!isSuccess && dataQr != null && (
              <div className="alert alert-danger mt-3">
                Lấy STT không thành công
              </div>
            )}

            {isSuccess && (
              <div className="alert alert-success mt-3">
                Đã thấy STT thành công
              </div>
            )}
          </div>
        </section>
        <br />

        <section>
          {queues.length > 0 && customerResult && customerResult.length > 0 && (
            <CustomerQueues
              queues={queues}
              queuehascustomers={customerResult || []}
            />
          )}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const device_info = context.req.headers["user-agent"] || navigator.userAgent;
  const queues = await db.queue.findMany();
  const queues_stringify = JSON.stringify(queues);

  return { props: { device_info, queues_stringify } };
};

export default Home;

const registerCustomer = async (deviceinfo: string): Promise<boolean> => {
  // const url = `${app_url}/api/insertcustomer`;
  const url = `/api/insertcustomer`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerid: md5(deviceinfo), deviceinfo }),
  });

  return res.ok;
};

const addCustomerToQueue = async (
  queueid: string,
  customerid: string,
  order: number,
  status: number
): Promise<boolean> => {
  // const url = app_url + "/api/inserttoqueue";
  const url = "/api/inserttoqueue";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queueid,
      customerid,
      order,
      status,
    }),
  });

  return res.ok;
};

const updateCustomerToQueue = async (
  queueid: string,
  customerid: string,
  status: string
): Promise<boolean> => {
  const url = "/api/updatetoqueue";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queueid,
      customerid,
      status,
    }),
  });

  return res.ok;
};

const getQueueWithCode = (queueCode: string, queues: queue[]) => {
  let result: queue | undefined;
  queues.forEach((queue: queue) => {
    if (queue.Code == queueCode) {
      result = queue;
    }
  });

  return result;
};

const makeid = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
