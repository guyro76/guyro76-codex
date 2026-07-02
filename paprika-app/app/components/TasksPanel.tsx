'use client';

import { ListTodo, Plus } from 'lucide-react';
import type { AgencyTask, TaskStatus } from '../../lib/types';

export default function TasksPanel({ tasks, cycle, openTask }: { tasks: AgencyTask[]; cycle: (task: AgencyTask) => void; openTask: () => void }) {
  const statuses: TaskStatus[] = ['לביצוע', 'בטיפול', 'הושלם'];
  return <div className="page-stack">
    <section className="page-hero"><div className="page-hero-icon"><ListTodo/></div><div><h2>משימות ו-SLA</h2><p>לוח עבודה עם בעלות, דחיפות, מועדים ומעקב ביצוע.</p></div><div className="page-hero-action"><button className="btn primary" onClick={openTask}><Plus size={17}/>משימה חדשה</button></div></section>
    <div className="grid task-columns">{statuses.map((status) => <section className="kanban-column" key={status}>
      <div className="section-head"><h3>{status}</h3><span className="counter">{tasks.filter((task) => task.status === status).length}</span></div>
      <div className="list">{tasks.filter((task) => task.status === status).map((task) => <button className="task-card" key={task.id} onClick={() => cycle(task)}>
        <span className={`priority priority-${task.priority}`}>{task.priority}</span><b>{task.title}</b><p>{task.client_name} · {task.due_label}</p><small>{task.owner || 'לא הוקצה'} · לחץ לקידום סטטוס</small>
      </button>)}</div>
    </section>)}</div>
  </div>;
}
