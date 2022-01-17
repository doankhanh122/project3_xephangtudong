import { queue, queue_has_customer } from "@prisma/client";
import { Fragment } from "react";
import styles from "../styles/Home.module.css";

const CustomerQueues: React.FC<{
  queues: queue[];
  queuehascustomers: queue_has_customer[];
}> = ({ queues, queuehascustomers }) => {
  return (
    <Fragment>
      <p>
        {" "}
        <strong>Hàng đợi của bạn: </strong>
      </p>
      {queuehascustomers.map((row) => {
        return (
          <div
            key={row.queue_QueueID}
            className="alert alert-success text-center"
          >
            <strong>{" Số thứ tự của bạn: "}</strong>
            {row.enrollstatus_EnrollStatusID == 0 ? (
              <div>
                <br />
                <div>
                  {" "}
                  <span className={`badge bg-success ${styles.bignum}`}>
                    {row.Order}
                  </span>
                </div>
              </div>
            ) : (
              <span className="badge bg-secondary">{row.Order}</span>
            )}{" "}
            <hr />
            <div
              className={`badge ${
                row.enrollstatus_EnrollStatusID == 0
                  ? "bg-warning"
                  : "bg-secondary"
              }`}
            >
              {row.enrollstatus_EnrollStatusID == 0
                ? "Vui lòng chờ được phục vụ"
                : "Đã được phục vụ"}
            </div>
            <hr />
            <strong>{"ID: "} </strong>
            {row.queue_QueueID}
            <strong>{" - Địa điểm: "}</strong>
            {queues.map((queue) => {
              return `${queue.QueueID == row.queue_QueueID ? queue.Place : ""}`;
            })}
            {row.enrollstatus_EnrollStatusID == 0 && (
              <div>
                {/* <br /> */}
                <br />
                <strong>{" Check In: "}</strong>
                <span className="badge bg-success">
                  {row.EnrollTime &&
                    new Date(row.EnrollTime).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </Fragment>
  );
};

export default CustomerQueues;
