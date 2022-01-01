import { NextPage } from "next";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { type } from "os";
import { PropsWithChildren, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import styles from "../styles/Home.module.css";
import { Queue } from ".";

const QrCodePage: NextPage<{ queues: Queue[] }> = ({ queues }) => {
  const { query } = useRouter();
  const id_: any = query.id?.toString();
  const id: number | undefined = parseInt(id_);
  console.log(typeof id);
  console.log(id);
  console.log(query);
  console.log(typeof query);
  return (
    <main className={styles.main}>
      {isNaN(id) ? (
        <ul className="list-unstyled ">
          {queues.map((queue) => {
            return (
              <li className="m-1" key={queue.QueueID}>
                <div className="card p-3">
                  <div className="card-title bg-success">
                    {/* className=" text-white text-decoration-none" */}
                    <Link href={`/qrcode?id=${queue.QueueID}`}>
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
                      {new Date(queue.EffectFrom).toLocaleString("vi-VN")} tới{" "}
                      {new Date(queue.EffectTo).toLocaleString("vi-VN")}
                    </p>
                    <p>
                      <strong>Edition: </strong> {queue.Edition}
                    </p>
                    <p>
                      <strong>Code: </strong> {queue.Code}
                    </p>
                    <div className="text-center">
                      <QRCode value={queue.Code} />
                    </div>
                  </div>
                </div>
                <br />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card">
          <div className="card-title">
            <p>
              <strong>ID: {queues[id].QueueID - 1}</strong>
            </p>
          </div>

          <div className="card-text">
            <p>
              <strong>Địa điểm: </strong>
              {queues[id].Place}
            </p>
            <p>
              <strong>Người tạo: </strong>
              {queues[id].Author}
            </p>
            <p>
              <strong>Thời gian: </strong>{" "}
              {new Date(queues[id].EffectFrom).toLocaleString("vi-VN")} tới{" "}
              {new Date(queues[id].EffectTo).toLocaleString("vi-VN")}
            </p>
            <p>
              <strong>Edition: </strong> {queues[id].Edition}
            </p>
            <p>
              <strong>Code: </strong> {queues[id].Code}
            </p>
            <div className="text-center">
              <QRCode value={queues[id].Code} />
            </div>

            <div className="mt-2 text-center">
              <Link href="/qrcode">
                <a className="btn btn-success ">Quay lại</a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

QrCodePage.getInitialProps = async (): Promise<{ queues: Queue[] }> => {
  const url = process.env.APP_URL + "/api/getqueue";
  const res = await fetch(url);
  const json = await res.json();
  // console.log(json);
  return {
    queues: json && json,
  };
};

export default QrCodePage;
