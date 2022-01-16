import type { NextPage } from "next";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
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
import { queue, queue_has_customer } from "@prisma/client";
import db from "../lib/dbconnection";
import { mutate } from "swr";
import WarningDialog from "../components/warningDialog";

const QrReader: any = dynamic(() => import("react-qr-reader"), { ssr: false });
const md5 = require("md5");

export type RequestResponse = {
  code: string;
  message: string;
};

const Home: NextPage<{
  device_info: string;
  queues_stringify: string;
}> = ({ device_info, queues_stringify }) => {
  // console.log("Customer Queue \n" + customerQueues[0].customers_CustomerID);
  const queues: queue[] = JSON.parse(queues_stringify);
  const [customerQueue, setCustomerQueue] = useState<queue>();
  const [cookie, setCookie, removeCookie] = useCookies(["customerId"]);

  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState(false);
  const [dataQr, setDataQr] = useState(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  // const [hasCookie, setHasCookie] = useState(false);

  const [isDuplicate, setIsDuplicate] = useState(false);

  const [isClickResetCookie, setIsClickResetCookie] = useState(false);

  const [isRequesting, setIsRequesting] = useState(false);

  // const [customerResult, setCustomerResult] = useState<queue_has_customer[]>();

  const handleScan = async (data: any) => {
    setDataQr(null);

    if (data != null && isCameraTurnedOn) {
      setDataQr(data);
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
    const customerid_cookie = await cookie.customerId;

    if (customerid_cookie === undefined) {
      const customerId = md5(device_info + makeid(3));
      setIsRequesting(true);
      const registerCustomerRes = await registerCustomer(
        customerId,
        device_info
      );

      setIsRequesting(false);

      if (registerCustomerRes) {
        await setCookie("customerId", customerId);
        // Add to Queue

        if (customerQueue == undefined) {
          // ma qrcode khong xac dinh
          setIsSuccess(false);
        } else {
          setIsRequesting(true);

          const addCustomerToQueueRes = await addCustomerToQueue(
            customerQueue.QueueID.toString(),
            customerId,
            1,
            0
          );

          setIsRequesting(false);

          if (addCustomerToQueueRes) {
            setIsSuccess(true);
            // Refetch lại hàng đợi khách đã đăng ký
            mutate(`/api/getqueuehascustomers/${customerId}`);
          } else {
            setIsSuccess(false);
          }
        }
      }
    } else {
      // CustomerID da luu trong cookie

      // Add to Queue
      if (customerQueue !== undefined) {
        const queueId = customerQueue.QueueID.toString();

        const isCustomerAlreadyInQueue = checkIsDuplicateQueue(
          queueId,
          queueHasCustomers
        );

        if (isCustomerAlreadyInQueue) {
          setIsDuplicate(true);
        } else {
          setIsRequesting(true);

          const addCustomerToQueueRes = await addCustomerToQueue(
            customerQueue.QueueID.toString(),
            customerid_cookie,
            1,
            0
          );

          setIsRequesting(false);

          if (addCustomerToQueueRes) {
            setIsSuccess(true);
            // Refetch lại hàng đợi khách đã đăng ký
            mutate(`/api/getqueuehascustomers/${cookie.customerId}`);
          } else {
            setIsSuccess(false);
            // await resetCookie();
          }
        }
      }
    }
  };

  const resetCookie = async () => {
    await removeCookie("customerId");
  };

  const updateCustomerToQueueHandler = async () => {
    setIsDuplicate(false);
    if (customerQueue !== undefined && !isLoading && !isError) {
      setIsRequesting(true);

      const res = await updateCustomerToQueue(
        customerQueue.QueueID.toString(),
        cookie.customerId
      );

      setIsRequesting(false);

      if (res) {
        setIsSuccess(true);
        // Refetch lại hàng đợi khách đã đăng ký
        mutate(`/api/getqueuehascustomers/${cookie.customerId}`);
      }
    }
  };

  const { queueHasCustomers, isLoading, isError } = useQueueHasCustomers(
    cookie.customerId
  );

  const checkIsDuplicateQueue = (
    queueId: string,
    queue_has_customers: queue_has_customer[]
  ): boolean => {
    let result = false;
    queue_has_customers.forEach((row) => {
      if (row.queue_QueueID == queueId) {
        result = true;
      }
    });

    return result;
  };

  useEffect(() => {}, []);

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
                setIsSuccess(null);
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

            {customerQueue == undefined && dataQr !== null && (
              <div className="alert alert-danger mt-3">Mã QR không đúng</div>
            )}

            {!isSuccess &&
              isSuccess != null &&
              !isRequesting &&
              dataQr !== null && (
                <div className="alert alert-danger mt-3">
                  Lấy STT không thành công
                </div>
              )}

            {isSuccess && isSuccess != null && !isCameraTurnedOn && (
              <div className="alert alert-success mt-3">
                Đã thấy STT thành công
              </div>
            )}
            <br />
            {isRequesting && (
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}

            <br />

            <div
              className="btn btn-danger   mt-3"
              onClick={() => {
                setIsClickResetCookie((x) => !x);
              }}
            >
              {" "}
              Xóa cookie
            </div>

            {isClickResetCookie && (
              <WarningDialog
                title="Bạn có chắc chắn muốn xóa Cookie"
                desc="Xóa cookie sẽ xóa toàn bộ dữ liệu hàng đợi của bạn"
                action={resetCookie}
                cancel={() => {
                  setIsClickResetCookie(false);
                }}
              />
            )}
          </div>
        </section>
        <br />

        <section>
          {isLoading && (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          {isError && (
            <div>
              Lỗi !! Không thể lấy dữ liệu thông tin hàng đợi của quý khách
            </div>
          )}
          {!isLoading && queueHasCustomers && queueHasCustomers.length > 0 && (
            <CustomerQueues
              queues={queues}
              queuehascustomers={queueHasCustomers}
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

const registerCustomer = async (
  customerid: string,
  deviceinfo: string
): Promise<boolean> => {
  // const url = `${app_url}/api/insertcustomer`;
  const url = `/api/insertcustomer`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerid,
      deviceinfo,
    }),
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
  customerid: string
): Promise<boolean> => {
  const url = "/api/updatetoqueue";

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queueid,
      customerid,
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
