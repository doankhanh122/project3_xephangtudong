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

  const [isDuplicate, setIsDuplicate] = useState({
    isDouble: false,
    status: 1,
  });
  const [isRequesting, setIsRequesting] = useState(false);

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
        // Refetch lại hàng đợi khách đã đăng ký
        mutate(`/api/getqueuehascustomers/${cookie.customerId}`);
      }
    }
  };

  const { queueHasCustomers, isLoading, isError } = useQueueHasCustomers(
    cookie.customerId
  );

  const { asPath, route, query } = useRouter();
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

          setIsDuplicate((state) => {
            return { isDouble: isDouble, status: status };
          });
        }
      } else {
        setCustomerQueue(undefined);
      }
    }
  }, [queueHasCustomers, query, queues]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Project 3</title>
        <meta name="description" content="Hỗ trợ khách hàng lấy số thứ tự" />
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
                !isDuplicate.isDouble &&
                isDuplicate.status === 0
              }
              onClose={() => {
                // setCustomerQueue(undefined);
              }}
            />

            {/* <DuplicateWarning confirm={updateCustomerToQueueHandler} /> */}
            {/* Hiện cảnh báo khách hàng đã lấy STT rồi và đã được phục vụ rồi*/}
            {/* <WarningDialog
              title="Cảnh báo"
              desc={`Bạn đã lấy số STT cho địa điểm: ${customerQueue?.Place}, bạn có chắc chắn muốn lấy lại STT
                mới?`}
              action={updateCustomerToQueueHandler}
              onClose={() => {
                setIsDuplicate((state) => {
                  return { isDouble: false, status: state.status };
                });
              }}
              open={isDuplicate.isDouble && isDuplicate.status == 1}
            /> */}

            {/* Hiện cảnh báo nếu người dùng đã lấy STT và đang chờ đến lượt */}

            <WarningDialog
              title="Thông báo"
              desc="Bạn đã lấy số thứ tự trước đó rồi! Vui lòng chờ đến lượt bạn nhé"
              action={() => {}}
              onClose={() => {
                setIsDuplicate(() => {
                  return { isDouble: false, status: 0 };
                });
              }}
              open={
                isDuplicate.isDouble &&
                isDuplicate.status == 0 &&
                !customerQueue
              }
              withButton={false}
            ></WarningDialog>

            {!isSuccess && isSuccess != null && !isRequesting && (
              <div className="alert alert-danger mt-3">
                Lấy STT không thành công
              </div>
            )}

            {isSuccess && isSuccess != null && (
              <div className="alert alert-success mt-3">
                Đã thấy STT thành công
              </div>
            )}

            {isRequesting && <Spinner />}

            <div className="text-decoration-none mt-3">
              {" "}
              <a className="text-decoration-none">
                <Link href={"/"}>Trở về trang chủ</Link>
              </a>
            </div>
          </div>
        </section>
        {/* <br /> */}

        <section>
          {isLoading && <Spinner />}
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
      </main>

      <footer className={styles.footer}>
        <p>Giảng viên hướng dẫn: Thầy Nguyễn Đức Tiến</p>
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
