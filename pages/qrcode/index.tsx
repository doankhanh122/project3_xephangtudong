import { GetServerSideProps, NextPage } from "next";
import { useGetQueues } from "../../lib/swr-hooks";
import QRCode from "react-qr-code";
import Link from "next/link";
import { queue } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
// import { Server } from "socket.io";
import { io } from "socket.io-client";
import { makeid, updateQueue } from "..";
import { mutate } from "swr";
import { Router } from "next/router";

const QrCodesPage: NextPage<{ app_url: string }> = ({ app_url }) => {
  const { queues, isLoading, isError } = useGetQueues();
  const [isNeedRefresh, setIsNeedRefresh] = useState(false);
  const [queueID, setQueueID] = useState("");

  const fetchQueue = useCallback(async (queueid, code) => {
    await updateQueue(queueid, code);
    mutate(`/api/getqueue`);
  }, []);

  useEffect(() => {
    // const io = new Server(3000);
    // io.on("connection", (socket) => {
    //   console.log(socket.id);
    // });
    const socket = io({ path: "/api/socketio" });
    // const socket = io({ path: "/qrcode" });
    // socket.connect();

    // console.log("Socket Client");
    // console.log(socket);

    // socket.on("connect", () => {
    //   console.log("Qrcode Page Socket connected");
    // });

    // socket.emit("message", "Khanh");

    socket.on("queueid", (queueid) => {
      console.log("QueueID need refresh: " + queueid);
      fetchQueue(queueid, makeid(3));
    });
  });

  if (isNeedRefresh) {
    // mutate(`/api/getqueue`);
  }

  return (
    <div>
      {queues &&
        queues.map((queue: queue) => {
          return (
            <li className="m-1" key={queue.QueueID}>
              <div className="card p-3">
                <div className="card-title bg-success">
                  {/* className=" text-white text-decoration-none" */}
                  <Link href={`/qrcode/${queue.QueueID}`}>
                    <a className=" text-white text-decoration-none">
                      <strong>ID:</strong> {queue.QueueID}
                    </a>
                  </Link>
                </div>

                <div className="card-text">
                  <p>
                    <strong>Địa điểm: </strong>
                    {queue.Place}
                  </p>
                  <p>
                    <strong>Người tạo: </strong>
                    {queue.Author}
                  </p>
                  <p>
                    <strong>Thời gian: </strong>{" "}
                    {queue.EffectFrom?.toLocaleString("vi-VN")} tới{" "}
                    {queue.EffectTo?.toLocaleString("vi-VN")}
                  </p>
                  <p>
                    <strong>Edition: </strong> {queue.Edition}
                  </p>
                  <p>
                    <strong>Code: </strong> {queue.Code}
                  </p>
                  <div className="text-center">
                    {queue.Code && (
                      <QRCode value={`${app_url}/${queue.Code}`} />
                    )}
                  </div>
                </div>
              </div>
              <br />
            </li>
          );
        })}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const app_url = process.env.APP_URL || "";

  return { props: { app_url } };
};

export default QrCodesPage;
