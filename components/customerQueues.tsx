import { Fragment } from "react";
import { useQueueHasCustomers } from "../lib/swr-hooks";
import { Queue, QueueHasCustomers } from "../pages";

const CustomerQueues: React.FC<{
  queues: Queue[];
  queuehascustomers: QueueHasCustomers[];
}> = ({ queues, queuehascustomers }) => {
  return (
    <Fragment>
      <p>
        {" "}
        <strong>Hàng đợi của bạn: </strong>
      </p>
      {queuehascustomers.map((row) => {
        return (
          <div key={row.queues_QueueID} className="alert alert-success">
            <strong>{"ID: "} </strong>
            {row.queues_QueueID}
            <strong>{" - Địa điểm: "}</strong>
            {queues.map((queue) => {
              return `${
                queue.QueueID == row.queues_QueueID ? queue.Place : ""
              }`;
            })}
            <hr />

            <strong>{" Số thứ tự của bạn: "}</strong>
            <span className="badge bg-success">{row.Order}</span>
          </div>
        );
      })}
    </Fragment>
  );
};

export default CustomerQueues;
