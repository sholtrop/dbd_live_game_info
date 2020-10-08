import React from "react";
import "./RadioButton.css";

interface Props {
  name: string;
  onChange: (text: string) => void;
  text: string | React.ReactElement;
  checked?: boolean;
  className?: string;
}

const RadioButton: React.FC<Props> = ({
  name,
  onChange,
  text,
  checked = false,
  className = "",
}) => {
  return (
    <label
      className={"radio-button-container " + className}
      key={text.toString()}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={({ target }) => {
          onChange(target.value);
        }}
      />
      <span className="checkmark"></span> {text}
    </label>
  );
};

export default RadioButton;
