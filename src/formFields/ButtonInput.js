import React from "react";
import Button from "../fields/ButtonWidget";

export default function ButtonInput(props) {
  const { uiSchema } = props;
  return <Button uiSchema={uiSchema} />;
}
