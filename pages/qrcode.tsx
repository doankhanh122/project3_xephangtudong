import { NextPage } from "next";
import { useRouter } from "next/router";
import { type } from "os";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import styles from "../styles/Home.module.css";

export interface Queue {
  QueueID: number;
  EffectFrom: Date;
  EffectTo: Date;
  Author: string;
  Place: string;
  Edition: string;
  Code: string;
}

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
        <ul>
          {queues.map((queue) => {
            return (
              <li key={queue.QueueID}>
                <div className="card">
                  <div className="card-title">
                    <p>
                      <strong>ID: {queue.QueueID}</strong>
                    </p>
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
          </div>
        </div>
      )}
    </main>
  );
};

export async function getServerSideProps() {
  const url = process.env.APP_URL + "/api/getqueue";
  const res = await fetch(url);
  const json = await res.json();
  console.log(json);
  return {
    props: { queues: json && json },
  };
}

export default QrCodePage;
