"use client";
import {Toaster} from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

export default function ToastProvider() {
    return (
        <>
        <NextTopLoader color="#e5e5e5" height={2} showSpinner={false} />
        <Toaster position="bottom-right" toastOptions={{
        style: { background: '#171717', color: '#e5e5e5', border: '1px solid #262626' }
    }} />
        </>
    )
}