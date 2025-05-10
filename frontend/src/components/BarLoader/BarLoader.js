import React from "react";
import BarLoader from "react-spinners/BarLoader";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const overrideStyle = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

export const Bar = (props) => {
    return (
        <div>
            <BarLoader color={"#4A4A4A"} loading={props.loading} width={250} css={overrideStyle} size={100} />
        </div>
    )
}