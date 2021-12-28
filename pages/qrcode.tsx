import { NextPage } from "next"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import styles from "../styles/Home.module.css"



const QrCodePage: NextPage = () => {

    return (
        <main className={styles.main}><QRCode value="{'name':'Khanh'}"/></main>
        
    )
}

export default QrCodePage
