import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { useCookies } from "react-cookie";

import GetNumberDialog from "../components/getNumberDialog";
import CustomerQueues from "../components/customerQueues";
import { useQueueHasCustomers } from "../lib/swr-hooks";
import { GetServerSideProps } from "next";
import { queue, queue_has_customer } from "@prisma/client";
import db from "../lib/dbconnection";
import { mutate } from "swr";
import WarningDialog from "../components/warningDialog";
import Spinner from "../components/spinner";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import {
  addCustomerToQueue,
  checkIsDuplicateQueue,
  getQueueWithCode,
  makeid,
  registerCustomer,
  updateCustomerToQueue,
} from ".";

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

  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  // const [hasCookie, setHasCookie] = useState(false);

  if (isSuccess && isSuccess != null) {
    Router.push({ pathname: "/", query: { isSuccessful: true } });
  }

  const [isDuplicate, setIsDuplicate] = useState<{
    isDouble: boolean;
    status: number;
  }>();

  const [isRequesting, setIsRequesting] = useState(false);
  const [isDialogOpened, setIsDialogOpened] = useState(false);

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
          if (status == 1) {
            updateCustomerToQueueHandler(
              customerQueue.QueueID.toString(),
              customerid_cookie
            );
          } else {
            setIsDuplicate({ isDouble: isDouble, status: status });
          }
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

  const updateCustomerToQueueHandler = async (
    queueId: string,
    customerId: string
  ) => {
    // setIsDuplicate((state) => {
    //   return { isDouble: false, status: state.status };
    // });
    if (customerQueue !== undefined && !isLoading && !isError) {
      setIsRequesting(true);

      const res = await updateCustomerToQueue(queueId, customerId);

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
  console.log("queueHasCustomers: ");
  console.log(queueHasCustomers);

  const { asPath, route, query } = useRouter();
  console.log("Hien queue id: ");
  console.log(query.slug); // Hien queue id
  useEffect(() => {
    if (query.slug && query.slug?.length > 0) {
      const queue = getQueueWithCode(query.slug[0], queues);
      console.log(queue);
      if (queue !== undefined) {
        setCustomerQueue(queue);

        if (queueHasCustomers != undefined) {
          const { isDouble, status } = checkIsDuplicateQueue(
            queue.QueueID.toString(),
            queueHasCustomers
          );

          console.log("IsDuplicate: " + isDouble);
          console.log("Status: " + status);

          setIsDuplicate((state) => {
            return { isDouble: isDouble, status: status };
          });
        }
      } else {
        setCustomerQueue(undefined);
      }
    }
  }, [queueHasCustomers]); //queueHasCustomers, query, queues

  return (
    <div className={styles.container}>
      <Head>
        <title>Project 3</title>
        <meta name="description" content="H??? tr??? kh??ch h??ng l???y s??? th??? t???" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="text-center">
          <div className={styles.description}>
            <GetNumberDialog
              queue={customerQueue}
              insertCustomerToQueue={() => {
                insertCustomerToQueueHandler();
                // setIsDuplicate((state) => {
                //   return { isDouble: true, status: 1 };
                // });
                // setCustomerQueue(undefined);
              }}
              open={
                customerQueue != undefined &&
                !isRequesting &&
                isDuplicate != undefined &&
                (!isDuplicate.isDouble ||
                  (isDuplicate.isDouble && isDuplicate.status == 1)) &&
                // isDuplicate.status === 0 &&
                isSuccess == undefined &&
                !isDialogOpened
              }
              onClose={() => {
                // console.log("Dong cua so lay stt");
                setIsDialogOpened(true);
                // setCustomerQueue(undefined);
              }}
            />

            {/* <DuplicateWarning confirm={updateCustomerToQueueHandler} /> */}
            {/* Hi???n c???nh b??o kh??ch h??ng ???? l???y STT r???i v?? ???? ???????c ph???c v??? r???i*/}
            {/* <WarningDialog
              title="C???nh b??o"
              desc={`B???n ???? l???y s??? STT cho ?????a ??i???m: ${customerQueue?.Place}, b???n c?? ch???c ch???n mu???n l???y l???i STT
                m???i?`}
              action={updateCustomerToQueueHandler}
              onClose={() => {
                setIsDuplicate((state) => {
                  return { isDouble: false, status: state.status };
                });
              }}
              open={isDuplicate.isDouble && isDuplicate.status == 1}
            /> */}

            {/* Hi???n c???nh b??o n???u ng?????i d??ng ???? l???y STT v?? ??ang ch??? ?????n l?????t */}

            <WarningDialog
              title="Th??ng b??o"
              desc="B???n ???? l???y s??? th??? t??? tr?????c ???? r???i! Vui l??ng ch??? ?????n l?????t b???n nh??"
              action={() => {}}
              onClose={() => {
                // setIsDuplicate(() => {
                //   return { ...isDuplicate, status: 1 };
                // });
                setIsDialogOpened(true);
                Router.push("/");
              }}
              open={
                isDuplicate != undefined &&
                isDuplicate.isDouble &&
                isDuplicate.status == 0 &&
                !isSuccess &&
                !isDialogOpened
                // !customerQueue
              }
              withButton={false}
            ></WarningDialog>

            {!isSuccess && isSuccess != null && !isRequesting && (
              <div className="alert alert-danger mt-3">
                L???y STT kh??ng th??nh c??ng
              </div>
            )}

            {isSuccess && isSuccess != null && (
              <div className="alert alert-success mt-3">
                ???? th???y STT th??nh c??ng
              </div>
            )}

            {isRequesting && <Spinner />}

            <div className="text-decoration-none mt-3">
              {" "}
              {/* <a className="text-decoration-none">
                <Link href={"/"}>Tr??? v??? trang ch???</Link>
              </a> */}
              <Link href={"/"}>Tr??? v??? trang ch???</Link>
            </div>
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
  const queues_stringify = JSON.stringify(queues);

  return { props: { device_info, queues_stringify } };
};

export default Home;
