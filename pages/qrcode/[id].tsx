import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import QRCode from "react-qr-code";
import styles from "../styles/Home.module.css";
import { Queue } from "..";
import { useGetQueue } from "../../lib/swr-hooks";
import { useCallback, useEffect, useState } from "react";

const QrCodePage: NextPage<{ queues: Queue[] }> = ({ queues }) => {
  const router = useRouter();
  const id = router.query.id?.toString() || "";
  const { queue, isLoading, isError } = useGetQueue(id);

  const [myQueue, setMyQueue] = useState<Queue>();

  useEffect(() => {
    queue && setMyQueue(queue[0]);
  }, [queue]);

  return (
    <div>
      {myQueue && (
        <div className="card p-3">
          <div className="card-title">
            <p>
              <strong>ID: {myQueue.QueueID}</strong>
            </p>
          </div>

          <div className="card-text">
            <p>
              <strong>Địa điểm: </strong>
              {myQueue.Place}
            </p>
            <p>
              <strong>Người tạo: </strong>
              {myQueue.Author}
            </p>
            <p>
              <strong>Thời gian: </strong>{" "}
              {new Date(myQueue.EffectFrom).toLocaleString("vi-VN")} tới{" "}
              {new Date(myQueue.EffectTo).toLocaleString("vi-VN")}
            </p>
            <p>
              <strong>Edition: </strong> {myQueue.Edition}
            </p>
            <p>
              <strong>Code: </strong> {myQueue.Code}
            </p>
            <div className="text-center">
              <QRCode value={myQueue.Code} />
            </div>

            <div className="mt-2 text-center">
              <Link href="/qrcode">
                <a className="btn btn-success ">Quay lại</a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodePage;
