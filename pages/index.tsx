import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import Warning from "../components/warning";

import { useCookies } from "react-cookie";
import { parseCookies } from "../helpers/";

function getTime(date: Date) {
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

interface customer {
  id: number;
  name: string;
  time: string;
}

const DUMMY_LISTING: customer[] = [
  {
    id: 1,
    name: "Mr Tiến",
    time: getTime(new Date(Date.now())),
  },
  { id: 2, name: "Mr Khánh", time: getTime(new Date(Date.now() + 101068)) },
  { id: 3, name: "Mr Quý", time: getTime(new Date(Date.now() + 202089)) },
];

const Home: NextPage<{ code: string; data: any }> = ({ code, data }) => {
  const [codeInput, setCodeInput] = useState("");
  const [customerList, setCustomerList] = useState(DUMMY_LISTING);

  const [cookie, setCookie] = useCookies(["customer"]);

  // const [isFirstLoaded, setIsFirstLoaded] = useState(true);
  const [isCodeValidate, setCodeValidate] = useState(true);
  const onValidateHandler = (codeInput: string) => {
    setCodeValidate(codeInput === code);
  };

  const addCustomerToQueue = (customer: customer) => {
    let newListCustomer = [...customerList];
    newListCustomer.push(customer);
    setCustomerList(newListCustomer);
    console.log(newListCustomer);
    console.log("Old cookie");
    console.log(cookie);
    setCookie("customer", JSON.stringify(customer));
    console.log("New cookie");
    console.log(cookie);
  };

  // const removeCookie = () => {
  //   setCookie("customer", null);
  // };

  useEffect(() => {
    if (data.customer !== null) addCustomerToQueue(JSON.parse(data.customer));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Project 3</title>
        <meta name="description" content="Hỗ trợ khách hàng lấy số thứ tự" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section>
          <h1>Key KH phải nhập: {code}</h1>
          <h1>Cookie da luu : {data.customer}</h1>

          <h1 className={styles.title}>Lấy số thứ tự</h1>

          <p className={styles.description}>
            Để lấy số thứ tự, mời bạn nhập tên và mã vào ô dưới đây
          </p>

          <label>Tên: </label>

          <input type="text" defaultValue="Anonymous" disabled={true} />
          <p></p>
          <label>Mã lấy số thứ tự: </label>

          <input
            type="text"
            onChange={(e) => {
              setCodeInput(e.target.value);
            }}
            disabled={data.customer != null}
          />

          {!isCodeValidate && (
            <Warning text={"Mã không đúng, vui lòng nhập lại"} />
          )}

          {data.customer != null && <Warning text={"Bạn đã lấy STT rồi!"} />}

          <p></p>

          <button
            onClick={() => {
              // setIsFirstLoaded(false);
              if (codeInput === code) {
                let newCustomer: customer = {
                  id: customerList.length + 1,
                  name: "Anonymous",
                  time: getTime(new Date(Date.now())),
                };

                if (data.customer == null) addCustomerToQueue(newCustomer);
              }

              onValidateHandler(codeInput);
            }}
          >
            Lấy STT
          </button>

          {/* <button
            onClick={() => {
              // removeCookie();
            }}
          >
            Xóa STT đã lấy
          </button> */}
        </section>
        <br />
        <section>
          <h1 className={styles.title}>Danh sách hàng đợi</h1>

          <ul>
            {customerList.map((item) => {
              return (
                <li key={item.id}>
                  {item.id} {item.name} {item.time}{" "}
                  {item.id == JSON.parse(data.customer).id && "- Số TT của bạn"}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Giảng viên hướng dẫn: Thầy Nguyễn Đức Tiến
        </a>
      </footer>
    </div>
  );
};

Home.getInitialProps = async ({ req }) => {
  const url = process.env.APP_URL + "/api/getSession";
  const res = await fetch(url);
  const json = await res.json();

  const data = parseCookies(req);
  return { code: json.key, data: data };
};

export default Home;
