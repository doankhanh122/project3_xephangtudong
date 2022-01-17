import { queue, queue_has_customer } from "@prisma/client";
import { Fragment } from "react";

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
          <div key={row.queue_QueueID} className="alert alert-success">
            <strong>{" Số thứ tự của bạn: "}</strong>
            <span className="badge bg-success">
              <h1>{row.Order}</h1>
            </span>{" "}
            <span
              className={`badge ${
                row.enrollstatus_EnrollStatusID == 0 ? "bg-warning" : "bg-dark"
              }`}
            >
              <h5>
                {row.enrollstatus_EnrollStatusID == 0
                  ? "Đang chờ"
                  : "Bạn đã phục vụ"}
              </h5>
            </span>
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
