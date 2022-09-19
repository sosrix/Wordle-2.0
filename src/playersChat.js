export default function Chat() {
  return (
    <div>
      <div className="container">
        <div className="chatbox">
          <div className="top-bar">
            <div className="avatar">
              <p>W</p>
            </div>
            <div className="name">Chat with your nemesis</div>
          </div>
          <div className="middle">
            <div className="voldemort">
              <div className="incoming">
                <div className="bubble">Hey, Father's Day is coming up..</div>
                <div className="bubble">
                  What are you getting.. Oh, oops sorry dude.
                </div>
              </div>
              <div className="outgoing">
                <div className="bubble lower">Nah, it's cool.</div>
                <div className="bubble">
                  Well you should get your Dad a cologne. Here smell it. Oh
                  wait! ...
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-bar">
            <div className="chat">
              <input type="text" placeholder="Type a message..." />
              <button type="submit">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
