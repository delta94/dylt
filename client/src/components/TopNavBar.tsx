import React from "react";
import {
  Button,
  Space,
} from 'antd';
import Link from "next/link";
import { useMeQuery } from "../generated/graphql";

interface TopNavBarProps { }

export const TopNavBar: React.FC<TopNavBarProps> = ({ }) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <Space>
          <Link href="/register">
            <Button>Inscription</Button>
          </Link>
          <Link href="/login">
            <Button type="primary">Connexion</Button>
          </Link>
        </Space>
      </>
    );
    // user is logged in
  } else {
    body = (
      <>
        <Space>
          <div>{data.me.username}</div>
          <Link href="/logout">
            <Button type="primary">Déconnexion</Button>
          </Link>
        </Space>
      </>
    );
  }

  return (
    <>
      {body}
    </>
  );
};