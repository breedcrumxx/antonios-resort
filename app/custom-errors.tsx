import { Result } from "antd";
import React from "react";

export function ComponentNotFound({ title, description }: {
  title?: string,
  description?: string,
}) {

  return (
    <Result
      status="404"
      title={title || "Your data went missing!"}
      subTitle={description || "We cannot find what you're looking for."}
    />
  )
}

export function ComponentError({ title, description }: {
  title?: string,
  description?: string,
}) {

  return (
    <Result
      status="500"
      title={title || "An error occured!"}
      subTitle={description || "An error occured while processing your request, please try again later!"}
    />
  )
}

