import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {Container} from "react-bootstrap";
import {MessagesProvider} from "@/context/MessagesContext";
import {ToastContainer} from "react-toastify";
import React from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MessagesProvider>
        <html lang="en">
        <body className={inter.className} suppressHydrationWarning={true}>
        <ToastContainer></ToastContainer>
        <Container>{children}</Container>
        </body>
        </html>
    </MessagesProvider>
  )
}