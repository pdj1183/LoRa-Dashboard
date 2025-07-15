import React from "react";

export default function Navbar(props) {
    const { currentTab, setTab } = props;
    const handleClick = (page) => {
        props.setTab(page)
        console.log((page))
    }
    return (
        <div className="navbar">
            {props.pages.map((page, index) => (
                <div
                    className={`navTab${page === currentTab ? " current" : ""}`}
                    key={index}
                    onClick={() => handleClick(page)}
                >
                    <h1>{page}</h1>
                </div>
            ))
            }
        </div >
    );
}
