import React from "react";
import {Link} from "react-router-dom";

export const WrapConditionalLink = ({ condition = false, to, children }) => ( 
    condition ?
        <Link to={to}>
            {children}
        </Link>
    : children
);