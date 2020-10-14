import React, { useState, useEffect } from "react";
import TLN from "./tln.min.js";

interface TextAreaProps {
  text: string;
  setText: (text: string) => void;
}

let once = true;

export default (props: TextAreaProps) => {
  useEffect(() => {
    if (once) {
      once = false;
      TLN.append_line_numbers("code");
    }
  });

  return (
    <textarea spellCheck="false" id="code" onChange={(e) => props.setText(e.target.value)} value={props.text}/>
  );
};
