import React from "react";

const Warning: React.FC<{ text: string }> = ({ text }) => {
  return <p style={{ color: "red" }}>{text}</p>;
};

export default Warning;
