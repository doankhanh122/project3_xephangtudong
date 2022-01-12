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
            <strong>{"ID: "} </strong>
            {row.queue_QueueID}
            <strong>{" - Địa điểm: "}</strong>
            {queues.map((queue) => {
              return `${queue.QueueID == row.queue_QueueID ? queue.Place : ""}`;
            })}
            <hr />
            <strong>{" Số thứ tự của bạn: "}</strong>
            <span className="badge bg-success">{row.Order}</span> {}
            <span className="badge bg-warning">{"Đang chờ"}</span>
            <br />
            <br />
            <strong>{" Check In: "}</strong>
            <span className="badge bg-success">
              {row.EnrollTime?.toLocaleString("vi-VN")}
            </span>
          </div>
        );
      })}
    </Fragment>
  );
};

export default CustomerQueues;
