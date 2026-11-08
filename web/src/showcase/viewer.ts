// Opens a showcase flow on Heddle's own canvas, in the dialog of the gallery.
//
// The canvas is the editor's createEditor, copied in by scripts/sync_editor.mjs and
// left as it is. This file keeps it read-only and shows what a clicked node holds.
import { createEditor } from './editor/rete_editor.js';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

interface Field {
  type: string;
  name: string;
  label?: string;
  options?: { label: string; value: string }[];
}

interface Definition {
  name: string;
  description?: string;
  outputs: string[];
  ui_fields: Field[];
}

interface FlowNode {
  id: string;
  type: string;
  label: string;
  controls: Record<string, Json>;
  position: { x: number; y: number };
}

interface Connection {
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

interface Comment {
  id: string;
  text: string;
  [key: string]: Json;
}

export interface Flow {
  id: string;
  nodes: FlowNode[];
  connections: Connection[];
  comments: Comment[];
}

export interface Gallery {
  definitions: Record<string, Definition>;
  flows: Flow[];
}

export interface FlowCopy {
  title: string;
  summary: string;
  labels: Record<string, string>;
  notes: Record<string, string>;
}

export interface Copy {
  inspector: { idle: string; fields: string; outputs: string };
  flows: Record<string, FlowCopy>;
}

type NodeElement = HTMLElement & { data?: { id: string } };

export function viewer(dialog: HTMLDialogElement, gallery: Gallery, copy: Copy) {
  const canvas = dialog.querySelector<HTMLElement>('[data-canvas]')!;
  const inspector = dialog.querySelector<HTMLElement>('[data-inspector]')!;
  const title = dialog.querySelector<HTMLElement>('[data-title]')!;
  const summary = dialog.querySelector<HTMLElement>('[data-summary]')!;

  let editor: Awaited<ReturnType<typeof createEditor>> | null = null;
  let current: { flow: Flow; nodes: FlowNode[] } | null = null;

  readOnly(dialog, canvas);

  const nodeElements = () => [...canvas.querySelectorAll<NodeElement>('custom-node')];

  const focus = (id: string | null) => {
    for (const element of nodeElements()) {
      if (element.data?.id === id) element.dataset.focus = '';
      else delete element.dataset.focus;
    }
  };

  // A press on a node that doesn't drag it opens what it holds. The canvas takes
  // the pointer while it is down, so the node is the one the press started on.
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      const element = (event.target as Element).closest<NodeElement>('custom-node');
      if (!element?.data || event.button !== 0) return;
      const id = element.data.id;
      const start = { x: event.clientX, y: event.clientY };
      window.addEventListener(
        'pointerup',
        (up) => {
          if (Math.hypot(up.clientX - start.x, up.clientY - start.y) <= 4) show(id);
        },
        { once: true },
      );
    },
    true,
  );

  function show(id: string) {
    if (!current) return;
    focus(id);
    inspector.replaceChildren(...details(current.flow, current.nodes, id));
  }

  function idle() {
    focus(null);
    inspector.replaceChildren(paragraph(copy.inspector.idle, 'muted'));
  }

  async function open(id: string) {
    const flow = gallery.flows.find((candidate) => candidate.id === id);
    if (!flow) return false;
    const text = copy.flows[id];

    title.textContent = text?.title ?? id;
    summary.textContent = text?.summary ?? '';

    if (!dialog.open) dialog.showModal();

    // The canvas measures itself, so it is made once the dialog is on screen.
    editor ??= await createEditor(canvas);
    const nodes = flow.nodes.map((node) => ({ ...node, label: text?.labels[node.id] ?? node.label }));
    const comments = flow.comments.map((comment) => ({ ...comment, text: text?.notes[comment.id] ?? comment.text }));
    current = { flow, nodes };
    await editor.importData({ nodes, connections: flow.connections, comments, definitions: gallery.definitions });
    idle();
    return true;
  }

  // --- What a node holds ----------------------------------------------------

  function details(flow: Flow, nodes: FlowNode[], id: string): Node[] {
    const node = nodes.find((candidate) => candidate.id === id)!;
    const definition = gallery.definitions[node.type];
    const labelOf = (target: string) => nodes.find((candidate) => candidate.id === target)?.label ?? target;

    const parts: Node[] = [];
    const heading = document.createElement('h3');
    heading.textContent = node.label;
    parts.push(heading, paragraph(node.type, 'kind'));
    if (definition?.description) parts.push(paragraph(definition.description, 'muted'));

    const fields = definition && fieldList(node, definition);
    if (fields) parts.push(subheading(copy.inspector.fields), fields);

    const outgoing = flow.connections.filter((connection) => connection.source === id);
    if (outgoing.length > 0) {
      const list = document.createElement('ul');
      list.className = 'outputs';
      for (const connection of outgoing) {
        const item = document.createElement('li');
        const port = document.createElement('span');
        port.className = 'port';
        port.textContent = connection.sourceOutput;
        item.append(port, ` → ${labelOf(connection.target)}`);
        list.append(item);
      }
      parts.push(subheading(copy.inspector.outputs), list);
    }
    return parts;
  }

  // The fields filled in, as the node's form shows them.
  function fieldList(node: FlowNode, definition: Definition) {
    const list = document.createElement('dl');
    list.className = 'fields';

    for (const field of definition.ui_fields) {
      let value = node.controls[field.name];
      if (field.type === 'code') {
        const language = String(node.controls.language ?? 'elixir');
        value = node.controls[`code_${language}`] || node.controls.code || '';
      }
      if (value === '' || value === null || value === undefined) continue;

      const term = document.createElement('dt');
      term.textContent = field.label ?? field.name;
      const description = document.createElement('dd');
      const text = String(value);
      if (field.type === 'code' || field.type === 'textarea' || text.includes('\n')) {
        description.className = 'block';
        description.append(pre(text));
      } else {
        const option = field.options?.find((candidate) => candidate.value === value);
        description.textContent = option?.label ?? text;
      }
      list.append(term, description);
    }
    return list.children.length > 0 ? list : null;
  }

  return { open, close: () => dialog.close() };
}

function subheading(text: string) {
  const element = document.createElement('h4');
  element.textContent = text;
  return element;
}

function paragraph(text: string, className: string) {
  const element = document.createElement('p');
  element.className = className;
  element.textContent = text;
  return element;
}

function pre(text: string) {
  const element = document.createElement('pre');
  element.tabIndex = 0;
  element.textContent = text;
  return element;
}

// The editor answers keys, menus and drags meant for editing. Here they would only
// change the copy on screen, so they stop before they reach it.
function readOnly(dialog: HTMLElement, canvas: HTMLElement) {
  const board = dialog.querySelector<HTMLElement>('[data-board]')!;

  // The browser's own menu still opens.
  board.addEventListener('contextmenu', (event) => event.stopPropagation(), true);
  board.addEventListener(
    'dblclick',
    (event) => {
      event.stopPropagation();
      event.preventDefault();
    },
    true,
  );
  // Without Ctrl the wheel scrolls, as anywhere else.
  board.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) event.stopPropagation();
    },
    true,
  );
  // The editor listens on the document for Delete, undo, copy and paste, and "a" for
  // a new node. Their default actions, like closing the dialog on Escape, still happen.
  window.addEventListener(
    'keydown',
    (event) => {
      const editing = ['Delete', 'Backspace', 'Escape', 'a', 'c', 'v', 'y', 'z'].includes(event.key);
      const inside = canvas.contains(document.activeElement) || document.activeElement === dialog;
      if (editing && (inside || document.activeElement === document.body)) event.stopPropagation();
    },
    true,
  );
}
