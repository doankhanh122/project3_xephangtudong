import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Warning from "../components/warning";

import { useCookies } from "react-cookie";
import DeviceDetector from "device-detector-js";

// import QrReader from 'react-qr-reader'
import dynamic from "next/dynamic";
import { AnyCnameRecord } from "dns";
import insertCustomer from "./api/insertcustomer";
import { Queue } from "./qrcode";
import context from "react-bootstrap/esm/AccordionContext";

const QrReader: any = dynamic(() => import("react-qr-reader"), { ssr: false });
var md5 = require("md5");

function getTime(date: Date) {
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

interface customer {
  id: number;
  name: string;
  time: string;
}

const DUMMY_LISTING: customer[] = [
  {
    id: 1,
    name: "Mr Tiến",
    time: getTime(new Date(Date.now())),
  },
  { id: 2, name: "Mr Khánh", time: getTime(new Date(Date.now() + 101068)) },
  { id: 3, name: "Mr Quý", time: getTime(new Date(Date.now() + 202089)) },
];

const Home: NextPage<any> = ({ code, app_url }) => {
  const [codeInput, setCodeInput] = useState("");
  const [customerList, setCustomerList] = useState(DUMMY_LISTING);

  const [cookieDeviceInfo, setCookieDeviceInfo] = useCookies(["deviceInfo"]);

  const [browserInfo, setBrowserInfo] = useState("");

  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState(false);
  const [dataQr, setDataQr] = useState(null);

  // const [isFirstLoaded, setIsFirstLoaded] = useState(true);
  const [isCodeValidate, setCodeValidate] = useState(true);
  const onValidateHandler = (codeInput: string) => {
    setCodeValidate(codeInput === code);
  };

  const handleScan = async (data: any) => {
    setDataQr(data);

    if (data != null && isCameraTurnedOn) {
      // insertCustomer(null, null)
      // const insertCustomerUrl: string =
      //   process.env.APP_URL + "/api/insertcustomer";
      // console.log(insertCustomerUrl);
      // const insertCustomerRes = await fetch(insertCustomerUrl);
      // const insertCustomerResJson = await insertCustomerRes.json();
      // console.log(insertCustomerResJson);
      setIsCameraTurnedOn(false);
      const res = await registerCustomer(app_url);

      const customerid = await res.json().then((data) => {
        return data.customerId;
      });

      const queueid = await getQueueID(app_url, data);

      if (queueid !== "") {
        await addCustomerToQueue(app_url, queueid, customerid, "0", "0");
      }
    }
  };

  const handleError = (err: AnyCnameRecord) => {
    console.error(err);
  };

  // const removeCookie = () => {
  //   setCookie("customer", null);
  // };

  // DEVICE DETECTOR
  const deviceDetector = new DeviceDetector();
  var userAgent;

  useEffect(() => {
    userAgent = navigator.userAgent;
    console.log(userAgent);
    setBrowserInfo(userAgent);
    setCookieDeviceInfo("deviceInfo", userAgent);
    console.log(deviceDetector.parse(userAgent));
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
          <h1>Hash value: {md5("Khanh")} </h1>
          <h1>UserAgent: {browserInfo} </h1>
          <h1>Key KH phải nhập: {code}</h1>
          {/* <h1>Cookie da luu : {data.customer != undefined && data.customer}</h1> */}

          <h1 className={styles.title}>Lấy số thứ tự</h1>

          <p className={styles.description}>
            Để lấy số thứ tự, mời bạn nhập tên và mã vào ô dưới đây
          </p>

          <div className={styles.description}>
            <label>Tên: </label>

            <input type="text" defaultValue="Anonymous" disabled={true} />
            <p></p>
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
              className="btn btn-dark"
              onClick={() => {
                setIsCameraTurnedOn((isCameraTurnedOn) => !isCameraTurnedOn);
              }}
            >
              {isCameraTurnedOn ? "Dừng quét" : "Quét ngay"}
            </button>

            {dataQr !== null && (
              <div className="alert alert-success"> {dataQr}</div>
            )}
          </div>
        </section>
        <br />
        <section>
          <h1 className={styles.title}>Danh sách hàng đợi</h1>
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

Home.getInitialProps = async ({ req }) => {
  const url = process.env.APP_URL + "/api/getstatus";
  const res = await fetch(url);
  const json = await res.json();

  return { code: json.key, app_url: process.env.APP_URL };
};

export default Home;

const registerCustomer = async (app_url: string) => {
  const url = `${app_url}/api/insertcustomer`;
  const res = await fetch(url);
  return res;
};

const addCustomerToQueue = async (
  app_url: string,
  queueid: string,
  customerid: string,
  order: string,
  status: string
) => {
  const url = app_url + "/api/inserttoqueue";
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

  return res;
};

const getQueueID = async (app_url: string, queueCode: string) => {
  const url = app_url + "/api/getqueue";
  const res = await fetch(url);
  const queues = await res.json();

  console.log(queues);
  console.log(typeof queues);

  let queueid: string = "";
  queues.forEach((queue: Queue) => {
    // if (queue.Code === queueCode) {
    //   return queue.QueueID;
    // }

    if (queue.Code == queueCode) {
      queueid = queue.QueueID.toString();
    }

    console.log(queue);
  });

  return queueid;
};
