import { NextPage } from "next";
import { useRouter } from "next/router";

interface CustomerToShow {
  customerid: string;
  order: number;
  status: number;
  enrolltime: Date;
}

const QueueHasCustomer: NextPage<{ queueid: number; customers: [] }> = ({
  queueid,
  customers,
}) => {
  return (
    <div>
      {!isNaN(queueid) && (
        <div className="text-center">
          <p>
            <strong>QueueID: </strong>
            {queueid}
          </p>
          <p>
            <strong>Danh sách hàng đợi</strong>
          </p>
        </div>
      )}
    </div>
  );
};

QueueHasCustomer.getInitialProps = async ({ query }) => {
  // const { query } = useRouter();
  // const queueid_: any = req.query.queueid?.toString();
  // const queueid: number | undefined = parseInt(queueid_);

  const queueid_: any = query.queueid?.toString();
  const queueid: number | undefined = parseInt(queueid_);
  const res = await fetch(
    process.env.APP_URL + `/api/getqueuehascustomers?queueid=${queueid}`
  );

  const customers = await res.json();

  return {
    queueid,
    customers,
  };
};

export default QueueHasCustomer;
