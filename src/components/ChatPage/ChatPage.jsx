import { useEffect, useMemo, useRef, useState } from "react";

/* self-contained icons so the chat node is portable */
function Glyph({ d, size = 16, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}
const BotGlyph = () => (
  <Glyph d={<><rect x="3.5" y="8" width="17" height="12" rx="3" /><path d="M12 4v4M12 4a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 12 4Z" /><path d="M8.5 13.5h.01M15.5 13.5h.01" /><path d="M2.5 12.5v3M21.5 12.5v3" /></>} size={17} />
);
const SendGlyph = () => <Glyph d={<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></>} size={17} />;
const SearchGlyph = () => <Glyph d={<><circle cx="11" cy="11" r="7" /><path d="m21 21-3.6-3.6" /></>} size={14} />;

const BOT = { id: "bot", name: "Assistant", role: "AI companion", color: "linear-gradient(135deg,#8b7cf6,#22d3ee)", bot: true };
const PEOPLE = [
  { id: "ava", name: "Ava Rodriguez", role: "Product design", color: "#fb7185" },
  { id: "noah", name: "Noah Williams", role: "Engineering", color: "#60a5fa" },
  { id: "mia", name: "Mia Chen", role: "Marketing", color: "#a78bfa" },
];

const QUICK_REPLIES = ["Summarize the board", "Add a task", "What can you do?"];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const initialConversations = {
  bot: [
    { id: 1, text: "Hi! I'm your board assistant 👋 Ask me to summarize the canvas, add a task, or explain any node.", mine: false, time: "09:30" },
  ],
  ava: [
    { id: 1, text: "The new flow is looking great. Can we review the editor node next?", mine: false, time: "10:42" },
    { id: 2, text: "Absolutely — I just wired up a live demo on the board.", mine: true, time: "10:44" },
  ],
  noah: [{ id: 1, text: "Pushed the fix for the pencil tool. Give it a try!", mine: false, time: "09:12" }],
  mia: [{ id: 1, text: "Love the dark theme. Very on-brand ✨", mine: false, time: "Yesterday" }],
};

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function botReply(text) {
  const value = text.toLowerCase();
  if (value.includes("summar")) return "This canvas has 7 nodes: a launch checklist (2/3 done), an approval task, a calendar, a code editor, a sketch pad, a note, and me. Want the details on any of them?";
  if (value.includes("add") || value.includes("task")) return "Drag the Task tile from the left rail onto the canvas — or tell me the title and I'll track it here for you.";
  if (value.includes("what") || value.includes("help") || value.includes("can you")) return "I can summarize the canvas, suggest next steps, and explain any node. Try a quick reply below 👇";
  if (/\b(hi|hey|hello|yo)\b/.test(value)) return "Hey! 👋 What are we building today?";
  return "Got it — noted. Want me to turn that into a task on the board?";
}

const PEER_REPLIES = [
  "Nice — I'll take a look and share feedback shortly.",
  "Sounds good to me 👍",
  "On it. Give me a few minutes.",
  "Great progress! Let's sync after this.",
];

function ChatPage() {
  const contacts = useMemo(() => [BOT, ...PEOPLE], []);
  const [activeId, setActiveId] = useState("bot");
  const [conversations, setConversations] = useState(initialConversations);
  const [drafts, setDrafts] = useState({});
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState({ noah: 1 });
  const messagesRef = useRef(null);
  const replyTimer = useRef(null);

  const active = contacts.find((contact) => contact.id === activeId);
  const messages = conversations[activeId] || [];
  const draft = drafts[activeId] || "";

  const filtered = contacts.filter((contact) => contact.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typing, activeId]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const openContact = (id) => {
    setActiveId(id);
    setUnread((current) => ({ ...current, [id]: 0 }));
  };

  const push = (id, message) =>
    setConversations((current) => ({ ...current, [id]: [...(current[id] || []), message] }));

  const send = (rawText) => {
    const text = (rawText ?? draft).trim();
    if (!text) return;
    const targetId = activeId;
    push(targetId, { id: Date.now(), text, mine: true, time: now() });
    setDrafts((current) => ({ ...current, [targetId]: "" }));
    setTyping(true);
    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const reply = targetId === "bot" ? botReply(text) : PEER_REPLIES[Math.floor(Math.random() * PEER_REPLIES.length)];
      push(targetId, { id: Date.now() + 1, text: reply, mine: false, time: now() });
      setTyping(false);
    }, 950);
  };

  return (
    <div className="chat-page">
      <aside className="chat-people nodrag nowheel">
        <div className="chat-brand">
          <span className="brand-mark"><BotGlyph /></span>
          <div><strong>Messages</strong><small>{PEOPLE.length + 1} conversations</small></div>
        </div>
        <label className="chat-search">
          <SearchGlyph />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people" aria-label="Search people" />
        </label>

        <div className="people-scroll">
          <div className="people-label">Assistant</div>
          {filtered.filter((contact) => contact.bot).map((contact) => (
            <ContactRow key={contact.id} contact={contact} active={activeId === contact.id} unread={unread[contact.id]} preview={preview(conversations[contact.id])} onClick={() => openContact(contact.id)} />
          ))}

          <div className="people-label">Team <span>{PEOPLE.length}</span></div>
          {filtered.filter((contact) => !contact.bot).map((contact) => (
            <ContactRow key={contact.id} contact={contact} active={activeId === contact.id} unread={unread[contact.id]} preview={preview(conversations[contact.id])} onClick={() => openContact(contact.id)} />
          ))}
          {filtered.length === 0 && <p className="people-empty">No matches</p>}
        </div>
      </aside>

      <section className="chat-conversation">
        <header className="chat-header">
          <div className="chat-peer">
            <span className={`person-avatar ${active.bot ? "bot" : ""}`} style={{ background: active.color }}>
              {active.bot ? <BotGlyph /> : initials(active.name)}
            </span>
            <span className="chat-peer-text">
              <strong>{active.name}</strong>
              <small>{typing ? "typing…" : active.bot ? "Always online" : "Online now"}</small>
            </span>
          </div>
          <button type="button" className="chat-more nodrag" aria-label="Conversation options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>
        </header>

        <div className="chat-messages nodrag nowheel" ref={messagesRef}>
          <div className="chat-date">TODAY</div>
          {messages.map((message) => (
            <div className={`chat-message ${message.mine ? "mine" : ""}`} key={message.id}>
              {!message.mine && (
                <span className={`message-avatar ${active.bot ? "bot" : ""}`} style={{ background: active.color }}>
                  {active.bot ? <BotGlyph /> : active.name[0]}
                </span>
              )}
              <div className="message-col">
                <div className="message-bubble">{message.text}</div>
                <small>{message.time}</small>
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-message">
              <span className={`message-avatar ${active.bot ? "bot" : ""}`} style={{ background: active.color }}>
                {active.bot ? <BotGlyph /> : active.name[0]}
              </span>
              <div className="message-bubble typing"><i /><i /><i /></div>
            </div>
          )}
        </div>

        {active.bot && (
          <div className="quick-replies nodrag">
            {QUICK_REPLIES.map((reply) => (
              <button type="button" key={reply} onClick={() => send(reply)}>{reply}</button>
            ))}
          </div>
        )}

        <div className="chat-composer nodrag nowheel">
          <textarea
            value={draft}
            onChange={(event) => setDrafts((current) => ({ ...current, [activeId]: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
            }}
            placeholder={`Message ${active.name.split(" ")[0]}…`}
            rows="1"
            aria-label="Message"
          />
          <button type="button" className="send-button" onClick={() => send()} aria-label="Send message"><SendGlyph /></button>
        </div>
      </section>
    </div>
  );
}

function preview(messages) {
  if (!messages || messages.length === 0) return "";
  const last = messages[messages.length - 1];
  return `${last.mine ? "You: " : ""}${last.text}`;
}

function ContactRow({ contact, active, unread, preview, onClick }) {
  return (
    <button type="button" className={`person-row ${active ? "active" : ""}`} onClick={onClick}>
      <span className={`person-avatar ${contact.bot ? "bot" : ""}`} style={{ background: contact.color }}>
        {contact.bot ? <BotGlyph /> : initials(contact.name)}
        {!contact.bot && contact.id === "ava" && <i className="online-dot" />}
        {contact.bot && <i className="online-dot" />}
      </span>
      <span className="person-text">
        <strong>{contact.name}</strong>
        <small>{preview || contact.role}</small>
      </span>
      {unread ? <span className="unread-badge">{unread}</span> : null}
    </button>
  );
}

export default ChatPage;
