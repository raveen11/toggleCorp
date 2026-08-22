import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow as Flow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MonacoEditor from "../MonacoEditor/MonacoEditor";
import ChatPage from "../ChatPage/ChatPage";

/* ---------- identity colours (the board's signature) ---------- */
const NODE_ACCENT = {
  todo: "#8b7cf6",
  task: "#fbbf24",
  calendar: "#22d3ee",
  editor: "#60a5fa",
  note: "#fde047",
  shape: "#2dd4bf",
  draw: "#fb7185",
  chat: "#34d399",
};

/* ---------- inline icon set (Lucide-style, stroke = currentColor) ---------- */
const ICON_PATHS = {
  todo: (
    <>
      <rect x="3" y="5" width="6" height="6" rx="1.4" />
      <path d="m3.6 16.6 1.7 1.7 3-3.2" />
      <path d="M13 7h8M13 12.5h8M13 18h5" />
    </>
  ),
  task: (
    <>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
    </>
  ),
  editor: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  note: (
    <>
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.5L21 14.5V5a2 2 0 0 0-2-2z" />
      <path d="M14.5 21v-5.5a1 1 0 0 1 1-1H21" />
    </>
  ),
  shape: (
    <>
      <path d="M11.4 3.2 15.7 10a.7.7 0 0 1-.6 1.06H6.5A.7.7 0 0 1 5.9 10l4.3-6.8a.7.7 0 0 1 1.2 0Z" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <circle cx="17.5" cy="17" r="3.6" />
    </>
  ),
  draw: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 14.5a2 2 0 0 1-2 2H8l-4 3.5v-15a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
      <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" />
    </>
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 2.6-6.3L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </>
  ),
  present: (
    <>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
      <path d="m10.5 7.5 4 2.5-4 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M3.5 6.5h17" />
      <path d="M8.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v1.5" />
      <path d="M18.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V6.5" />
    </>
  ),
  eraser: (
    <>
      <path d="m7 21-4-4a1.8 1.8 0 0 1 0-2.6l9-9a1.8 1.8 0 0 1 2.6 0l4.4 4.4a1.8 1.8 0 0 1 0 2.6L14 21" />
      <path d="M21 21H8" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* small reusable node header */
function NodeHead({ type, title, subtitle, children }) {
  return (
    <div className="node-head">
      <span className="node-chip">
        <Icon name={type} size={16} />
      </span>
      <span className="node-head-text">
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      {children}
    </div>
  );
}

/* ---------- data helpers ---------- */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = [2024, 2025, 2026, 2027, 2028];
const ASSIGNEES = ["Unassigned", "Ava Rodriguez", "Noah Williams", "Mia Chen"];

function buildCalendar(year, monthIndex) {
  const startDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrev = new Date(year, monthIndex, 0).getDate();
  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false });
  let trailing = 1;
  while (cells.length % 7 !== 0) cells.push({ day: trailing++, muted: true });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function randomId() {
  return `#${Math.floor(Math.random() * 90000 + 10000)}`;
}

/* ---------- initial board ---------- */
const initialNodes = [
  { id: "todo-1", type: "todo", position: { x: 40, y: 150 }, data: { title: "Launch checklist", items: [
    { id: 1, text: "Wire up the chat node", done: true },
    { id: 2, text: "Fix the pencil tool", done: true },
    { id: 3, text: "Polish every node", done: false },
  ] } },
  { id: "note-1", type: "note", position: { x: 40, y: 470 }, data: { text: "Ship the MVP demo Friday 🎯", color: "#1c1a10", bg: "#fde047" } },
  { id: "task-1", type: "task", position: { x: 400, y: 150 }, data: { id: "#68865", title: "Approval flow", folder: "Default Folder" } },
  { id: "calendar-1", type: "calendar", position: { x: 400, y: 470 }, data: { month: 7, year: 2026 } },
  { id: "editor-1", type: "editor", position: { x: 830, y: 150 }, data: { value: "const status = 'ready';\nconsole.log(`Board Studio is ${status}`);" }, dragHandle: ".editor-drag-handle" },
  { id: "draw-1", type: "draw", position: { x: 830, y: 560 }, data: {} },
  { id: "chat-1", type: "chat", position: { x: 1400, y: 210 }, data: {}, dragHandle: ".chat-header" },
];

const initialEdges = [
  { id: "todo-task", source: "todo-1", target: "task-1" },
  { id: "task-cal", source: "task-1", target: "calendar-1" },
];

function defaultDataFor(type) {
  switch (type) {
    case "task":
      return { id: randomId(), title: "New task", folder: "Default Folder" };
    case "calendar":
      return { month: 7, year: 2026 };
    case "editor":
      return { value: "// Start typing here\n" };
    case "note":
      return { text: "", color: "#1c1a10", bg: "#fde047" };
    case "shape":
      return { shape: "square", color: "#2dd4bf", size: 96 };
    case "todo":
      return { title: "New list", items: [{ id: 1, text: "First task", done: false }] };
    default:
      return {};
  }
}

/* ======================= NODES ======================= */

function TodoNode({ data }) {
  const [items, setItems] = useState(data.items || []);
  const [draft, setDraft] = useState("");
  const done = items.filter((item) => item.done).length;

  const toggle = (id) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  const remove = (id) => setItems((current) => current.filter((item) => item.id !== id));
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setItems((current) => [...current, { id: Date.now(), text, done: false }]);
    setDraft("");
  };

  return (
    <div className="flow-node todo-node" style={{ "--accent": NODE_ACCENT.todo }}>
      <Handle type="target" position={Position.Left} />
      <NodeHead type="todo" title={data.title || "To-do"} subtitle={`${done}/${items.length} done`}>
        <button type="button" className="node-ghost-btn nodrag" onClick={() => setItems((c) => c.filter((i) => !i.done))}>
          Clear done
        </button>
      </NodeHead>
      <div className="todo-progress">
        <span style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
      </div>
      <ul className="todo-list nodrag nowheel">
        {items.map((item) => (
          <li key={item.id} className={item.done ? "todo-item done" : "todo-item"}>
            <button type="button" className="todo-check" onClick={() => toggle(item.id)} aria-label="Toggle task">
              {item.done ? <Icon name="todo" size={12} /> : null}
            </button>
            <span>{item.text}</span>
            <button type="button" className="todo-del" onClick={() => remove(item.id)} aria-label="Delete task">
              <Icon name="trash" size={13} />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="todo-empty">All clear — add your first task.</li>}
      </ul>
      <div className="todo-add nodrag">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") add(); }}
          placeholder="Add a task…"
          aria-label="New task"
        />
        <button type="button" onClick={add} aria-label="Add task"><Icon name="plus" size={15} /></button>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function TaskNode({ data }) {
  const [status, setStatus] = useState("TODO");
  const [assignee, setAssignee] = useState("Unassigned");
  const [priority, setPriority] = useState("Medium");
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flow-node task-node" style={{ "--accent": NODE_ACCENT.task }}>
      <Handle type="target" position={Position.Left} />
      <NodeHead type="task" title="Task" subtitle={data.id}>
        <select
          className={`status-pill status-${statusClass} nodrag`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Task status"
        >
          <option>TODO</option>
          <option>IN PROGRESS</option>
          <option>DONE</option>
        </select>
      </NodeHead>
      <div className="task-title">{data.title}</div>
      <div className="task-meta">
        <label className="task-field nodrag">
          <span className="person-avatar sm" style={{ background: assignee === "Unassigned" ? "#3a3f52" : NODE_ACCENT.chat }}>
            {assignee === "Unassigned" ? "?" : initials(assignee)}
          </span>
          <select value={assignee} onChange={(event) => setAssignee(event.target.value)} aria-label="Assignee">
            {ASSIGNEES.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className={`priority-tag priority-${priority.toLowerCase()} nodrag`}>
          <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
      </div>
      <div className="task-path">{data.title} · {data.folder}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CalendarNode({ data }) {
  const today = new Date();
  const [month, setMonth] = useState(data.month ?? today.getMonth());
  const [year, setYear] = useState(data.year ?? today.getFullYear());
  const [selected, setSelected] = useState(
    month === today.getMonth() && year === today.getFullYear() ? today.getDate() : 1,
  );
  const weeks = useMemo(() => buildCalendar(year, month), [year, month]);
  const isToday = (day, muted) =>
    !muted && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="flow-node calendar-node" style={{ "--accent": NODE_ACCENT.calendar }}>
      <Handle type="target" position={Position.Left} />
      <NodeHead type="calendar" title="Calendar" subtitle={`${MONTHS[month]} ${year}`} />
      <div className="calendar-selectors nodrag">
        <select value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="Month">
          {MONTHS.map((name, index) => <option key={name} value={index}>{name}</option>)}
        </select>
        <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Year">
          {YEARS.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-body nodrag">
        {weeks.map((week, weekIndex) => (
          <div className="calendar-grid" key={weekIndex}>
            {week.map((cell, dayIndex) => {
              const classes = ["calendar-day"];
              if (cell.muted) classes.push("muted-day");
              if (!cell.muted && cell.day === selected) classes.push("selected-day");
              if (isToday(cell.day, cell.muted)) classes.push("today");
              return (
                <button
                  type="button"
                  className={classes.join(" ")}
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => !cell.muted && setSelected(cell.day)}
                  disabled={cell.muted}
                >
                  {String(cell.day).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function EditorNode({ data }) {
  const [value, setValue] = useState(data.value);
  return (
    <div className="flow-node editor-node" style={{ "--accent": NODE_ACCENT.editor }}>
      <Handle type="target" position={Position.Left} />
      <MonacoEditor value={value} onChange={setValue} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const NOTE_SWATCHES = [
  { bg: "#fde047", color: "#1c1a10" },
  { bg: "#fca5c4", color: "#3a1224" },
  { bg: "#7dd3fc", color: "#082a3a" },
  { bg: "#86efac", color: "#0a2e1a" },
];

function NoteNode({ data }) {
  const [text, setText] = useState(data.text || "");
  const [fontSize, setFontSize] = useState(data.fontSize || 15);
  const [bg, setBg] = useState(data.bg || "#fde047");
  const [color, setColor] = useState(data.color || "#1c1a10");

  return (
    <div className="flow-node note-node" style={{ "--accent": NODE_ACCENT.note, background: bg, color }}>
      <Handle type="target" position={Position.Left} />
      <div className="note-toolbar nodrag nowheel">
        <span className="node-chip note-chip"><Icon name="note" size={15} /></span>
        <strong>Note</strong>
        <select value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} aria-label="Font size">
          <option value="14">S</option>
          <option value="15">M</option>
          <option value="18">L</option>
          <option value="22">XL</option>
        </select>
        <span className="note-swatches">
          {NOTE_SWATCHES.map((swatch) => (
            <button
              type="button"
              key={swatch.bg}
              className={bg === swatch.bg ? "swatch active" : "swatch"}
              style={{ background: swatch.bg }}
              onClick={() => { setBg(swatch.bg); setColor(swatch.color); }}
              aria-label="Note colour"
            />
          ))}
        </span>
      </div>
      <textarea
        className="note-input nodrag nowheel"
        value={text}
        onChange={(event) => setText(event.target.value)}
        style={{ fontSize: `${fontSize}px`, color }}
        placeholder="Type a note…"
        aria-label="Note text"
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const SHAPES = ["square", "circle", "diamond", "triangle"];

function ShapeNode({ data }) {
  const [shape, setShape] = useState(data.shape || "square");
  const [color, setColor] = useState(data.color || "#2dd4bf");
  const [size, setSize] = useState(data.size || 96);

  return (
    <div className="flow-node shape-node" style={{ "--accent": NODE_ACCENT.shape }}>
      <Handle type="target" position={Position.Left} />
      <NodeHead type="shape" title="Shape" />
      <div className="shape-toolbar nodrag nowheel">
        <select value={shape} onChange={(event) => setShape(event.target.value)} aria-label="Shape">
          {SHAPES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
        </select>
        <input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Shape colour" />
      </div>
      <div className="shape-stage">
        <div className={`shape-preview ${shape}`} style={{ background: color, width: size, height: size }} />
      </div>
      <input
        className="shape-size nodrag"
        type="range"
        min="48"
        max="140"
        value={size}
        onChange={(event) => setSize(Number(event.target.value))}
        aria-label="Shape size"
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const BRUSH_COLORS = ["#fb7185", "#8b7cf6", "#22d3ee", "#34d399", "#fbbf24", "#e7e9f2"];

function DrawNode() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#fb7185");
  const [brush, setBrush] = useState(4);
  const [erasing, setErasing] = useState(false);
  const stateRef = useRef({ color, brush, erasing });
  stateRef.current = { color, brush, erasing };

  const pointerPos = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // scale screen coords to the canvas' internal resolution (also corrects for React Flow zoom)
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event) => {
    event.stopPropagation();
    drawing.current = true;
    const context = canvasRef.current.getContext("2d");
    const { color: c, brush: b, erasing: e } = stateRef.current;
    context.globalCompositeOperation = e ? "destination-out" : "source-over";
    context.strokeStyle = c;
    context.lineWidth = e ? b * 2.4 : b;
    context.lineCap = "round";
    context.lineJoin = "round";
    const { x, y } = pointerPos(event);
    context.beginPath();
    context.moveTo(x, y);
    canvasRef.current.setPointerCapture?.(event.pointerId);
  };
  const draw = (event) => {
    if (!drawing.current) return;
    const context = canvasRef.current.getContext("2d");
    const { x, y } = pointerPos(event);
    context.lineTo(x, y);
    context.stroke();
  };
  const stopDrawing = () => { drawing.current = false; };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flow-node draw-node" style={{ "--accent": NODE_ACCENT.draw }}>
      <Handle type="target" position={Position.Left} />
      <NodeHead type="draw" title="Sketch" subtitle="Draw freely">
        <button type="button" className="node-ghost-btn nodrag" onClick={clear}>Clear</button>
      </NodeHead>
      <div className="draw-toolbar nodrag nowheel">
        <span className="brush-swatches">
          {BRUSH_COLORS.map((value) => (
            <button
              type="button"
              key={value}
              className={!erasing && color === value ? "swatch active" : "swatch"}
              style={{ background: value }}
              onClick={() => { setColor(value); setErasing(false); }}
              aria-label="Brush colour"
            />
          ))}
        </span>
        <input
          className="brush-size"
          type="range"
          min="2"
          max="16"
          value={brush}
          onChange={(event) => setBrush(Number(event.target.value))}
          aria-label="Brush size"
        />
        <button
          type="button"
          className={erasing ? "brush-tool active" : "brush-tool"}
          onClick={() => setErasing((value) => !value)}
          aria-label="Eraser"
        >
          <Icon name="eraser" size={15} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="draw-canvas nodrag nowheel"
        width="720"
        height="360"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function ChatNode() {
  return (
    <div className="flow-node chat-node" style={{ "--accent": NODE_ACCENT.chat }}>
      <Handle type="target" position={Position.Left} />
      <ChatPage />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  todo: TodoNode,
  task: TaskNode,
  calendar: CalendarNode,
  editor: EditorNode,
  note: NoteNode,
  shape: ShapeNode,
  draw: DrawNode,
  chat: ChatNode,
};

const paletteItems = [
  { type: "todo", label: "To-do" },
  { type: "task", label: "Task" },
  { type: "calendar", label: "Calendar" },
  { type: "editor", label: "Editor" },
  { type: "note", label: "Note" },
  { type: "shape", label: "Shape" },
  { type: "draw", label: "Sketch" },
  { type: "chat", label: "Chat" },
];

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: NODE_ACCENT.todo, strokeWidth: 2 },
};

/* ---------- palette ---------- */
function DropPalette() {
  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <aside className="flow-palette">
      <div className="palette-brand">BS</div>
      <div className="palette-rule" />
      {paletteItems.map((item) => (
        <button
          type="button"
          className="palette-item"
          draggable
          onDragStart={(event) => onDragStart(event, item.type)}
          key={item.type}
          style={{ "--accent": NODE_ACCENT[item.type] }}
          title={`Drag ${item.label} onto the canvas`}
        >
          <span className="palette-icon"><Icon name={item.type} size={19} /></span>
          <span className="palette-label">{item.label}</span>
        </button>
      ))}
      <div className="palette-rule palette-rule-bottom" />
      <button
        type="button"
        className="palette-item palette-reset"
        onClick={() => window.dispatchEvent(new CustomEvent("flow:reset"))}
        title="Reset the board"
      >
        <span className="palette-icon"><Icon name="reset" size={19} /></span>
        <span className="palette-label">Reset</span>
      </button>
    </aside>
  );
}

/* ---------- top app bar ---------- */
const COLLABORATORS = [
  { name: "Ava Rodriguez", color: "#fb7185" },
  { name: "Noah Williams", color: "#60a5fa" },
  { name: "Mia Chen", color: "#a78bfa" },
];

function TopBar({ onPresent, nodeCount }) {
  const [copied, setCopied] = useState(false);
  const share = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <header className="studio-topbar">
      <div className="studio-brand">
        <span className="studio-logo"><Icon name="shape" size={18} /></span>
        <div>
          <strong>Board Studio</strong>
          <small>Untitled canvas · {nodeCount} nodes</small>
        </div>
      </div>
      <div className="studio-actions">
        <div className="collab-stack" aria-label="Collaborators">
          {COLLABORATORS.map((person) => (
            <span key={person.name} className="collab-avatar" style={{ background: person.color }} title={person.name}>
              {initials(person.name)}
            </span>
          ))}
          <span className="collab-avatar more">+2</span>
        </div>
        <button type="button" className="btn-ghost" onClick={share}>
          <Icon name="share" size={15} />
          {copied ? "Link copied" : "Share"}
        </button>
        <button type="button" className="btn-primary" onClick={onPresent}>
          <Icon name="present" size={15} />
          Present
        </button>
      </div>
    </header>
  );
}

/* ======================= BOARD ======================= */
function ReactFlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowInstance, setFlowInstance] = useState(null);

  const addDroppedNode = useCallback(
    (event) => {
      const { type, position } = event.detail;
      const node = { id: `${type}-${Date.now()}`, type, position, data: defaultDataFor(type) };
      if (type === "editor") node.dragHandle = ".editor-drag-handle";
      if (type === "chat") node.dragHandle = ".chat-header";
      setNodes((current) => [...current, node]);
    },
    [setNodes],
  );
  const resetBoard = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    window.setTimeout(() => flowInstance?.fitView({ padding: 0.18, duration: 500 }), 60);
  }, [setEdges, setNodes, flowInstance]);
  const onConnect = useCallback(
    (connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (type && flowInstance)
        window.dispatchEvent(
          new CustomEvent("flow:add-node", {
            detail: { type, position: flowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY }) },
          }),
        );
    },
    [flowInstance],
  );

  useEffect(() => {
    window.addEventListener("flow:add-node", addDroppedNode);
    window.addEventListener("flow:reset", resetBoard);
    return () => {
      window.removeEventListener("flow:add-node", addDroppedNode);
      window.removeEventListener("flow:reset", resetBoard);
    };
  }, [addDroppedNode, resetBoard]);

  return (
    <div className="studio-shell">
      <TopBar nodeCount={nodes.length} onPresent={() => flowInstance?.fitView({ padding: 0.18, duration: 500 })} />
      <div className="flow-board">
        <DropPalette />
        <Flow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setFlowInstance}
          onDrop={onDrop}
          onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          className="flow-canvas"
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background variant={BackgroundVariant.Dots} color="#2b3042" gap={22} size={1.6} />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(node) => NODE_ACCENT[node.type] || NODE_ACCENT.todo}
            nodeStrokeWidth={0}
            maskColor="rgba(10, 12, 20, .72)"
          />
        </Flow>
      </div>
    </div>
  );
}

export default ReactFlowBoard;
