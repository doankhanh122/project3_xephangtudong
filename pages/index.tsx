import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { useCookies } from "react-cookie";

// import QrReader from 'react-qr-reader'
import dynamic from "next/dynamic";
import { AnyCnameRecord } from "dns";
import GetNumberDialog from "../components/getNumberDialog";
import CustomerQueues from "../components/customerQueues";
import { useQueueHasCustomers } from "../lib/swr-hooks";
import { GetServerSideProps } from "next";
import { queue, queue_has_customer } from "@prisma/client";
import db from "../lib/dbconnection";
import { mutate } from "swr";
import WarningDialog from "../components/warningDialog";
import Spinner from "../components/spinner";

const QrReader: any = dynamic(() => import("react-qr-reader"), { ssr: false });
const md5 = require("md5");

export type RequestResponse = {
  code: string;
  message: string;
};

const Home: NextPage<{
  device_info: string;
  queues_stringify: string;
  isSuccessfulFromSlug: boolean;
}> = ({ device_info, queues_stringify, isSuccessfulFromSlug }) => {
  // console.log("Customer Queue \n" + customerQueues[0].customers_CustomerID);
  const queues: queue[] = JSON.parse(queues_stringify);
  const [customerQueue, setCustomerQueue] = useState<queue>();
  const [cookie, setCookie, removeCookie] = useCookies(["customerId"]);

  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState(false);
  const [dataQr, setDataQr] = useState(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  // const [hasCookie, setHasCookie] = useState(false);

  const [isDuplicate, setIsDuplicate] = useState({
    isDouble: false,
    status: 0,
  });

  const [isClickResetCookie, setIsClickResetCookie] = useState(false);

  const [isRequesting, setIsRequesting] = useState(false);

  // const [customerResult, setCustomerResult] = useState<queue_has_customer[]>();

  // const handleScan = async (data: any) => {
  //   setDataQr(null);

  //   if (data != null && isCameraTurnedOn) {
  //     setDataQr(data);
  //     setIsCameraTurnedOn(false);

  //     // console.log("Customer ID cookie: " + cookie.customerid);
  //     const queue = getQueueWithCode(data, queues);
  //     // console.log(queue);
  //     if (queue !== undefined) {
  //       setCustomerQueue(queue);
  //     } else {
  //       setCustomerQueue(undefined);
  //     }
  //   }
  // };

  const handleScan = async (data: any) => {
    setDataQr(null);

    if (data != null && isCameraTurnedOn) {
      const raw_array = data.split("/");
      const code_string = raw_array[raw_array.length - 1];
      console.log(raw_array);
      setDataQr(code_string);
      setIsCameraTurnedOn(false);

      // console.log("Customer ID cookie: " + cookie.customerid);
      const queue = getQueueWithCode(code_string, queues);
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
        // Set cookies ton tai trong 1 ngay
        await setCookie("customerId", customerId, {
          path: "/",
          expires: new Date(Date.now() + 86400 * 1000),
        });
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
            // Refetch l???i h??ng ?????i kh??ch ???? ????ng k??
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

        const { isDouble, status } = checkIsDuplicateQueue(
          queueId,
          queueHasCustomers
        );

        if (isDouble) {
          setIsDuplicate({ isDouble: isDouble, status: status });
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
            // Refetch l???i h??ng ?????i kh??ch ???? ????ng k??
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
    setIsClickResetCookie(false);
    setIsSuccess(false);
  };

  const updateCustomerToQueueHandler = async () => {
    setIsDuplicate((state) => {
      return { isDouble: false, status: state.status };
    });
    if (customerQueue !== undefined && !isLoading && !isError) {
      setIsRequesting(true);

      const res = await updateCustomerToQueue(
        customerQueue.QueueID.toString(),
        cookie.customerId
      );

      setIsRequesting(false);

      if (res) {
        setIsSuccess(true);
        // Refetch l???i h??ng ?????i kh??ch ???? ????ng k??
        mutate(`/api/getqueuehascustomers/${cookie.customerId}`);
      }
    }
  };

  const { queueHasCustomers, isLoading, isError } = useQueueHasCustomers(
    cookie.customerId
  );

  if (isSuccessfulFromSlug && isSuccess == null) {
    setIsSuccess(true);
  }
  useEffect(() => {
    // setCookie("customerId", "khanh", {
    //   path: "/",
    //   expires: new Date(Date.now() + 10 * 1000),
    // });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Project 3</title>
        <meta name="description" content="H??? tr??? kh??ch h??ng l???y s??? th??? t???" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="text-center">
          <h3>M???i b???n l???y s??? th??? t???</h3>
          <div className={styles.description}>
            <label>Qu??t m?? QR ????? l???y s??? th??? t???</label>

            <p></p>

            {isCameraTurnedOn && (
              <div className="card mb-3">
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
                setIsSuccess(false);
                setIsCameraTurnedOn((isCameraTurnedOn) => !isCameraTurnedOn);
              }}
            >
              <h4>{isCameraTurnedOn ? "D???ng qu??t" : "Qu??t ngay"}</h4>
            </button>

            <GetNumberDialog
              queue={customerQueue}
              insertCustomerToQueue={insertCustomerToQueueHandler}
              open={dataQr !== null && customerQueue != undefined}
              onClose={() => {
                setDataQr(null);
              }}
            />

            {/* <DuplicateWarning confirm={updateCustomerToQueueHandler} /> */}
            {/* Hi???n c???nh b??o kh??ch h??ng ???? l???y STT r???i v?? ???? ???????c ph???c v??? r???i*/}
            <WarningDialog
              title="C???nh b??o"
              desc={`B???n ???? t???ng ???????c ph???c v??? t???i: ${customerQueue?.Place}, b???n c?? ch???c ch???n mu???n l???y l???i STT
                m???i?`}
              action={updateCustomerToQueueHandler}
              onClose={() => {
                setIsDuplicate((state) => {
                  return { isDouble: false, status: state.status };
                });
              }}
              open={isDuplicate.isDouble && isDuplicate.status == 1}
            />

            {/* Hi???n c???nh b??o n???u ng?????i d??ng ???? l???y STT v?? ??ang ch??? ?????n l?????t */}

            <WarningDialog
              title="Th??ng b??o"
              desc="B???n ???? l???y s??? th??? t??? tr?????c ???? r???i! Vui l??ng ch??? ?????n l?????t b???n nh??"
              action={() => {}}
              onClose={() => {
                setIsDuplicate(() => {
                  return { isDouble: false, status: 0 };
                });
              }}
              open={isDuplicate.isDouble && isDuplicate.status == 0}
              withButton={false}
            ></WarningDialog>
            {/* <Dialog
              open={isDuplicate.isDouble && isDuplicate.status == 0}
              onClose={() => {
                setIsDuplicate(() => {
                  return { isDouble: false, status: 0 };
                });
              }}
            >
              <DialogTitle>
                <strong>Th??ng b??o</strong>
              </DialogTitle>
              <DialogContent>
                <p>
                  <strong>
                    B???n ???? l???y s??? th??? t???, vui l??ng ch??? ?????n l?????t b???n nh??
                  </strong>
                </p>
              </DialogContent>
            </Dialog> */}

            {customerQueue == undefined && dataQr !== null && (
              <div className="alert alert-danger mt-3">M?? QR kh??ng ????ng</div>
            )}

            {!isSuccess &&
              isSuccess != null &&
              !isRequesting &&
              dataQr !== null && (
                <div className="alert alert-danger mt-3">
                  L???y STT kh??ng th??nh c??ng
                </div>
              )}

            {/* {(isSuccessfulFromSlug ||
              (isSuccess && isSuccess != null && !isCameraTurnedOn)) && (
              <div className="alert alert-success mt-3">
                ???? th???y STT th??nh c??ng
              </div>
            )} */}

            {isSuccess && isSuccess != null && !isCameraTurnedOn && (
              <div className="alert alert-success mt-3">
                ???? th???y STT th??nh c??ng
              </div>
            )}

            {/* {isSuccessfulFromSlug && (
              <div className="alert alert-success mt-3">
                ???? th???y STT th??nh c??ng
              </div>
            )} */}

            {isRequesting && <Spinner />}

            <br />
            {!isCameraTurnedOn && (
              <div
                className="btn btn-danger   mt-3"
                onClick={() => {
                  setIsClickResetCookie(true);
                }}
              >
                {" "}
                X??a cookie
              </div>
            )}

            <WarningDialog
              title="B???n c?? ch???c ch???n mu???n x??a Cookie"
              desc="X??a cookie s??? x??a to??n b??? d??? li???u h??ng ?????i c???a b???n"
              action={resetCookie}
              onClose={() => {
                setIsClickResetCookie(false);
              }}
              open={isClickResetCookie}
            />
          </div>
        </section>
        {/* <br /> */}

        <section>
          {isLoading && <Spinner />}
          {isError && (
            <div>
              L???i !! Kh??ng th??? l???y d??? li???u th??ng tin h??ng ?????i c???a qu?? kh??ch
            </div>
          )}
          {!isLoading && queueHasCustomers && queueHasCustomers.length > 0 && (
            <CustomerQueues
              queues={queues}
              queuehascustomers={queueHasCustomers}
            />
          )}
        </section>

        {/* <section>
          <h3 className={styles.title}>Danh s??ch ?????a ??i???m</h3>
          <ul>
            {queues.map((queue) => {
              return <li key={queue.QueueID}>{queue.Place}</li>;
            })}
          </ul>
        </section> */}
      </main>

      <footer className={styles.footer}>
        <p>Gi???ng vi??n h?????ng d???n: Th???y Nguy???n ?????c Ti???n</p>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const device_info = context.req.headers["user-agent"] || navigator.userAgent;
  const queues = await db.queue.findMany();
  db.$disconnect;
  const queues_stringify = JSON.stringify(queues);
  const previousRoute = context.req.headers.referer;

  const isSuccessfulFromSlug =
    context.query.isSuccessful != undefined &&
    previousRoute != undefined &&
    previousRoute.indexOf("?", 0) == -1
      ? context.query.isSuccessful
      : false;
  // const isSuccessfulFromSlug = context.query.isSuccessful;

  console.log(context.req.headers.referer);
  previousRoute && console.log(previousRoute.indexOf("x", 0));

  return { props: { device_info, queues_stringify, isSuccessfulFromSlug } };
};

export default Home;

export const registerCustomer = async (
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

export const addCustomerToQueue = async (
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

export const updateCustomerToQueue = async (
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

export const getQueueWithCode = (queueCode: string, queues: queue[]) => {
  let result: queue | undefined;
  queues.forEach((queue: queue) => {
    if (queue.Code == queueCode) {
      result = queue;
    }
  });

  return result;
};

export const checkIsDuplicateQueue = (
  queueId: string,
  queue_has_customers: queue_has_customer[]
): { isDouble: boolean; status: number } => {
  let isDouble: boolean = false,
    status: number = 0;
  queue_has_customers.forEach((row) => {
    if (row.queue_QueueID == queueId) {
      isDouble = true;
      status = row.enrollstatus_EnrollStatusID;
    }
  });

  return { isDouble, status };
};

export const makeid = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
