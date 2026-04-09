import React, { useState, useEffect } from 'react';
import './App.css';

const API = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchTodos = async () => {
    const res = await fetch(API);
    setTodos(await res.json());
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    fetchTodos();
  };

  const toggleTodo = async (todo) => {
    await fetch(`${API}/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    fetchTodos();
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle }),
    });
    setEditId(null);
    fetchTodos();
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') setEditId(null);
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="app">
      <div className="app-header">
        <h1>Todo List Yuseung</h1>
        <p>할 일을 추가하고 관리하세요</p>
      </div>
      <div className="card">
        <form onSubmit={addTodo} className="add-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="새로운 할 일을 입력하세요..."
            aria-label="New todo title"
          />
          <button type="submit" className="btn-primary">추가</button>
        </form>
        {todos.length === 0 ? (
          <div className="empty-state">아직 할 일이 없습니다</div>
        ) : (
          <>
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />
                  {editId === todo.id ? (
                    <>
                      <input
                        className="edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                        autoFocus
                        aria-label="Edit todo title"
                      />
                      <button className="btn-ghost" onClick={() => saveEdit(todo.id)}>저장</button>
                    </>
                  ) : (
                    <>
                      <span className="todo-text" onClick={() => startEdit(todo)}>{todo.title}</span>
                      <button className="btn-delete" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`}>✕</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="counter">{completedCount}/{todos.length} 완료</div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
