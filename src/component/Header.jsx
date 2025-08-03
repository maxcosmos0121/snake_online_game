import React from 'react';


function Header({onlineCount}) {
    return (
        <header className="navbar">
            <div className="logo">🐍 贪吃蛇 Online</div>
            <div className="status">在线人数：{onlineCount}</div>
        </header>
    );
}

export default Header;