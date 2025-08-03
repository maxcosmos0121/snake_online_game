import {useEffect, useState} from 'react';
import {useParams, useLocation, useNavigate} from 'react-router-dom';

function Room({socket}) {
    const {roomId} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState(location.state?.username || '');
    const [players, setPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit('joinRoom', {roomId, username});

        socket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('roomInfo', (data) => {
            setPlayers(data.players || []);
            setGameStarted(data.gameStarted || false);
        });

        socket.on('gameStarted', () => {
            setGameStarted(true);
            // 这里应该跳转到实际的游戏页面
            // 目前我们只显示一个提示
        });

        socket.on('playerJoined', (data) => {
            setPlayers(data.players || []);
        });

        socket.on('playerLeft', (data) => {
            setPlayers(data.players || []);
        });

        socket.on('playerReady', (data) => {
            setPlayers(data.players || []);
        });

        return () => {
            socket.emit('leaveRoom', {roomId});
            socket.off('receiveMessage');
            socket.off('roomInfo');
            socket.off('gameStarted');
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('playerReady');
        };
    }, [socket, roomId, username]);

    const sendMessage = () => {
        if (input.trim()) {
            const messageData = {
                roomId,
                username,
                text: input,
                timestamp: new Date().toISOString()
            };
            socket.emit('sendMessage', messageData);
            setMessages((prev) => [...prev, messageData]);
            setInput('');
        }
    };

    const toggleReady = () => {
        const newReadyState = !isReady;
        setIsReady(newReadyState);
        socket.emit('toggleReady', {roomId, isReady: newReadyState});
    };

    const startGame = () => {
        socket.emit('startGame', {roomId});
    };

    const leaveRoom = () => {
        socket.emit('leaveRoom', {roomId});
        navigate('/');
    };

    // 检查是否是房主（第一个加入房间的玩家）
    const isHost = players.length > 0 && players[0].username === username;

    return (
        <div className="room-container">
            <div className="room-header">
                <h2>房间号：{roomId}</h2>
                <button onClick={leaveRoom} className="btn btn-danger">离开房间</button>
            </div>

            <div className="room-content">
                <div className="players-section card">
                    <h3 className="card-title">玩家列表</h3>
                    <div className="players-list">
                        {players.map((player, index) => (
                            <div key={index} className={`player-item ${player.isReady ? 'ready' : ''} ${player.username === username ? 'current-player' : ''}`}>
                                <span className="player-name">{player.username}</span>
                                <span className="player-status">
                                    {player.username === username ? '(你)' : ''}
                                    {index === 0 ? ' (房主)' : ''}
                                    {player.isReady ? ' 已准备' : ' 未准备'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {!gameStarted && (
                        <div className="room-actions">
                            <button
                                onClick={toggleReady}
                                className={`btn ${isReady ? "btn-success" : "btn-primary"}`}
                            >
                                {isReady ? '取消准备' : '准备'}
                            </button>

                            {isHost && (
                                <button
                                    onClick={startGame}
                                    disabled={!players.every(p => p.isReady) || players.length < 2}
                                    className="btn btn-primary"
                                >
                                    开始游戏
                                </button>
                            )}
                        </div>
                    )}

                    {gameStarted && (
                        <div className="game-status">
                            <p>游戏已开始！</p>
                        </div>
                    )}
                </div>

                <div className="chat-section card">
                    <h3 className="card-title">房间聊天</h3>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <div key={index} className="chat-message">
                                <strong>{msg.username || '匿名'}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="输入消息..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="form-control"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage} className="btn btn-primary">发送</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Room;