import React from "react";

const Warning: React.FC<{ text: string }> = ({ text }) => {
  return <div className="alert alert-danger">{text}</div>;
};

export default Warning;
