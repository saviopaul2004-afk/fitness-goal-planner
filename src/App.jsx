import { useEffect, useMemo, useState } from "react";

const seedGoals = [
  { id: 1, title: "Morning walks", category: "Cardio", target: 20, current: 12, unit: "sessions", deadline: "2026-10-15", status: "In progress" },
  { id: 2, title: "Drink more water", category: "Wellness", target: 56, current: 39, unit: "glasses", deadline: "2026-10-01", status: "In progress" },
  { id: 3, title: "Strength routine", category: "Strength", target: 12, current: 12, unit: "sessions", deadline: "2026-09-15", status: "Completed" },
];

const seedActivities = [
  { id: 1, name: "Brisk walk", type: "Cardio", duration: 35, date: "2026-09-17", notes: "Park route" },
  { id: 2, name: "Bodyweight workout", type: "Strength", duration: 25, date: "2026-09-16", notes: "Push-ups and squats" },
  { id: 3, name: "Yoga flow", type: "Flexibility", duration: 20, date: "2026-09-15", notes: "Evening stretch" },
];

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const emptyGoal = { title: "", category: "Cardio", target: "", current: "", unit: "sessions", deadline: "", status: "In progress" };
const emptyActivity = { name: "", type: "Cardio", duration: "", date: new Date().toISOString().slice(0, 10), notes: "" };

function ProgressBar({ value }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><div className="progress-fill" style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

function GoalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyGoal);
  const [error, setError] = useState("");
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    const target = Number(form.target);
    const current = Number(form.current || 0);
    if (!form.title.trim() || !form.deadline || target <= 0 || current < 0) {
      setError("Please enter a goal name, a future target, current progress, and deadline.");
      return;
    }
    if (current > target) {
      setError("Current progress cannot be greater than the target.");
      return;
    }
    onSave({ ...form, title: form.title.trim(), target, current, status: current === target ? "Completed" : form.status });
  };
  return <form className="form-grid" onSubmit={submit} noValidate>
    <label>Goal name<input name="title" value={form.title} onChange={update} placeholder="e.g. Complete 15 workouts" /></label>
    <label>Category<select name="category" value={form.category} onChange={update}><option>Cardio</option><option>Strength</option><option>Flexibility</option><option>Wellness</option></select></label>
    <label>Target<input name="target" type="number" min="1" value={form.target} onChange={update} placeholder="15" /></label>
    <label>Current progress<input name="current" type="number" min="0" value={form.current} onChange={update} placeholder="0" /></label>
    <label>Unit<select name="unit" value={form.unit} onChange={update}><option>sessions</option><option>minutes</option><option>kilometres</option><option>glasses</option><option>days</option></select></label>
    <label>Deadline<input name="deadline" type="date" value={form.deadline} onChange={update} /></label>
    {error && <p className="form-error">{error}</p>}
    <div className="form-actions"><button className="primary" type="submit">{initial ? "Save changes" : "Add goal"}</button>{onCancel && <button className="secondary" type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}

function ActivityForm({ onSave }) {
  const [form, setForm] = useState(emptyActivity);
  const [error, setError] = useState("");
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.date || Number(form.duration) <= 0) {
      setError("Enter an activity name, date, and duration greater than zero.");
      return;
    }
    onSave({ ...form, name: form.name.trim(), duration: Number(form.duration) });
    setForm(emptyActivity);
    setError("");
  };
  return <form className="form-grid activity-form" onSubmit={submit} noValidate>
    <label>Activity<input name="name" value={form.name} onChange={update} placeholder="e.g. Cycling" /></label>
    <label>Type<select name="type" value={form.type} onChange={update}><option>Cardio</option><option>Strength</option><option>Flexibility</option><option>Wellness</option></select></label>
    <label>Duration (minutes)<input name="duration" type="number" min="1" value={form.duration} onChange={update} /></label>
    <label>Date<input name="date" type="date" value={form.date} onChange={update} /></label>
    <label className="wide">Notes (optional)<input name="notes" value={form.notes} onChange={update} placeholder="How did it go?" /></label>
    {error && <p className="form-error">{error}</p>}
    <div className="form-actions"><button className="primary" type="submit">Log activity</button></div>
  </form>;
}

function App() {
  const [page, setPage] = useState("Dashboard");
  const [goals, setGoals] = useState(() => readStorage("moveWellGoals", seedGoals));
  const [activities, setActivities] = useState(() => readStorage("moveWellActivities", seedActivities));
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalSearch, setGoalSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");

  useEffect(() => localStorage.setItem("moveWellGoals", JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem("moveWellActivities", JSON.stringify(activities)), [activities]);

  const completed = goals.filter((goal) => goal.status === "Completed" || goal.current >= goal.target).length;
  const average = goals.length ? Math.round(goals.reduce((sum, goal) => sum + Math.min(goal.current / goal.target, 1) * 100, 0) / goals.length) : 0;
  const weeklyMinutes = activities.reduce((sum, activity) => sum + activity.duration, 0);
  const filteredGoals = goals.filter((goal) => (goalFilter === "All" || goal.status === goalFilter) && goal.title.toLowerCase().includes(goalSearch.toLowerCase()));
  const filteredActivities = activities.filter((activity) => activityFilter === "All" || activity.type === activityFilter);
  const saveGoal = (goal) => {
    if (editingGoal) setGoals(goals.map((item) => item.id === editingGoal.id ? { ...goal, id: item.id } : item));
    else setGoals([{ ...goal, id: Date.now() }, ...goals]);
    setEditingGoal(null); setShowGoalForm(false);
  };
  const deleteGoal = (id) => setGoals(goals.filter((goal) => goal.id !== id));
  const toggleGoal = (goal) => setGoals(goals.map((item) => item.id === goal.id ? { ...item, current: item.status === "Completed" ? 0 : item.target, status: item.status === "Completed" ? "In progress" : "Completed" } : item));
  const addActivity = (activity) => setActivities([{ ...activity, id: Date.now() }, ...activities]);

  return <main>
    <header className="topbar"><a className="brand" href="#top" onClick={() => setPage("Dashboard")}><span>✦</span> MoveWell</a><nav>{["Dashboard", "Goals", "Activity Log"].map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>)}</nav></header>
    <section className="hero" id="top"><div><p className="eyebrow">YOUR PERSONAL FITNESS COMPANION</p><h1>Small steps. <em>Real progress.</em></h1><p>Plan your fitness goals, log every activity, and celebrate your consistency.</p><button className="primary" onClick={() => { setPage("Goals"); setShowGoalForm(true); }}>Create a goal</button></div><div className="hero-stat"><span>THIS WEEK</span><strong>{weeklyMinutes}</strong><small>active minutes logged</small></div></section>
    <section className="content">
      {page === "Dashboard" && <>
        <div className="section-heading"><div><p className="eyebrow">OVERVIEW</p><h2>Your progress at a glance</h2></div><button className="text-button" onClick={() => setPage("Goals")}>View all goals →</button></div>
        <div className="metrics"><article><span>Active goals</span><strong>{goals.filter((goal) => goal.status !== "Completed").length}</strong><small>goals in progress</small></article><article><span>Goals completed</span><strong>{completed}</strong><small>keep the momentum going</small></article><article><span>Average progress</span><strong>{average}%</strong><ProgressBar value={average} /></article></div>
        <div className="section-heading"><h2>Current goals</h2></div><div className="goal-grid">{goals.slice(0, 3).map((goal) => <GoalCard key={goal.id} goal={goal} onEdit={() => { setEditingGoal(goal); setShowGoalForm(true); setPage("Goals"); }} onDelete={() => deleteGoal(goal.id)} onToggle={() => toggleGoal(goal)} />)}</div>
      </>}
      {page === "Goals" && <>
        <div className="section-heading"><div><p className="eyebrow">GOAL CENTER</p><h2>Plan what you want to achieve</h2></div><button className="primary" onClick={() => { setEditingGoal(null); setShowGoalForm(!showGoalForm); }}>{showGoalForm ? "Close form" : "+ Add goal"}</button></div>
        {showGoalForm && <section className="panel"><h3>{editingGoal ? "Edit goal" : "New fitness goal"}</h3><GoalForm initial={editingGoal} onSave={saveGoal} onCancel={() => { setShowGoalForm(false); setEditingGoal(null); }} /></section>}
        <div className="toolbar"><input aria-label="Search goals" placeholder="Search goals" value={goalSearch} onChange={(event) => setGoalSearch(event.target.value)} /><select aria-label="Filter goal status" value={goalFilter} onChange={(event) => setGoalFilter(event.target.value)}><option>All</option><option>In progress</option><option>Completed</option></select></div>
        <div className="goal-grid">{filteredGoals.length ? filteredGoals.map((goal) => <GoalCard key={goal.id} goal={goal} onEdit={() => { setEditingGoal(goal); setShowGoalForm(true); }} onDelete={() => deleteGoal(goal.id)} onToggle={() => toggleGoal(goal)} />) : <p className="empty">No goals match your search.</p>}</div>
      </>}
      {page === "Activity Log" && <>
        <div className="section-heading"><div><p className="eyebrow">ACTIVITY LOG</p><h2>Every workout counts</h2></div></div>
        <section className="panel"><h3>Log a new activity</h3><ActivityForm onSave={addActivity} /></section>
        <div className="toolbar"><select aria-label="Filter activities" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}><option>All</option><option>Cardio</option><option>Strength</option><option>Flexibility</option><option>Wellness</option></select></div>
        <section className="activity-list">{filteredActivities.length ? filteredActivities.map((activity) => <article key={activity.id}><div className="activity-icon">{activity.type[0]}</div><div><h3>{activity.name}</h3><p>{activity.type} · {activity.date} {activity.notes && `· ${activity.notes}`}</p></div><strong>{activity.duration} min</strong><button className="icon-button" aria-label={`Delete ${activity.name}`} onClick={() => setActivities(activities.filter((item) => item.id !== activity.id))}>×</button></article>) : <p className="empty">No activities in this category yet.</p>}</section>
      </>}
    </section>
    <footer>MoveWell Fitness Goal Planner · Built with React</footer>
  </main>;
}

function GoalCard({ goal, onEdit, onDelete, onToggle }) {
  const percent = Math.round(Math.min(goal.current / goal.target, 1) * 100);
  return <article className="goal-card"><div className="goal-card-top"><span className="tag">{goal.category}</span><span className={`status ${goal.status === "Completed" ? "done" : ""}`}>{goal.status}</span></div><h3>{goal.title}</h3><p>Due {goal.deadline}</p><div className="goal-numbers"><strong>{goal.current} <small>/ {goal.target} {goal.unit}</small></strong><span>{percent}%</span></div><ProgressBar value={percent} /><div className="card-actions"><button className="text-button" onClick={onToggle}>{goal.status === "Completed" ? "Reopen" : "Mark done"}</button><button className="text-button" onClick={onEdit}>Edit</button><button className="danger" onClick={onDelete}>Delete</button></div></article>;
}

export default App;
