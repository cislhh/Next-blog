/**
 * Zustand Store 使用示例 - Todo 待办事项
 *
 * 演示功能:
 * - 列表状态管理
 * - 过滤和选择器
 * - 派生状态 (Getter)
 * - 历史记录
 */

import type { Action, Getter } from '../types';

import { createImmerStore, createStoreHelper } from '../base';
import { createUseStore, createGetterHook, useHistoryState } from '../hooks';

// ==================== 类型定义 ====================

export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: number;
    updatedAt: number;
}

interface TodoState {
    todos: Todo[];
    filter: 'all' | 'active' | 'completed';
    searchQuery: string;
}

interface TodoActions {
    addTodo: Action<TodoState, [title: string, description?: string]>;
    toggleTodo: Action<TodoState, [id: string]>;
    deleteTodo: Action<TodoState, [id: string]>;
    updateTodo: Action<TodoState, [id: string, data: Partial<Todo>]>;
    setFilter: Action<TodoState, [filter: TodoState['filter']]>;
    setSearchQuery: Action<TodoState, [query: string]>;
    clearCompleted: Action<TodoState>;
    toggleAll: Action<TodoState>;
}

type TodoStore = TodoState & TodoActions;

// ==================== Store 创建 ====================

const initialTodoState: TodoState = {
    todos: [],
    filter: 'all',
    searchQuery: '',
};

const todoActions: TodoActions = {
    addTodo(title, description) {
        const newTodo: Todo = {
            id: `todo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title,
            description,
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const state = this.getState();
        this.setState({ todos: [...state.todos, newTodo] });
    },
    toggleTodo(id) {
        const state = this.getState();
        const todos = state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
        );
        this.setState({ todos });
    },
    deleteTodo(id) {
        const state = this.getState();
        const todos = state.todos.filter((todo) => todo.id !== id);
        this.setState({ todos });
    },
    updateTodo(id, data) {
        const state = this.getState();
        const todos = state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...data, updatedAt: Date.now() } : todo
        );
        this.setState({ todos });
    },
    setFilter(filter) {
        this.setState({ filter });
    },
    setSearchQuery(query) {
        this.setState({ searchQuery: query });
    },
    clearCompleted() {
        const state = this.getState();
        const todos = state.todos.filter((todo) => !todo.completed);
        this.setState({ todos });
    },
    toggleAll() {
        const state = this.getState();
        const allCompleted = state.todos.every((todo) => todo.completed);
        const todos = state.todos.map((todo) => ({
            ...todo,
            completed: !allCompleted,
            updatedAt: Date.now(),
        }));
        this.setState({ todos });
    },
};

export const useTodoStore = createImmerStore(
    { ...initialTodoState, ...todoActions } as TodoStore,
    {
        name: 'todo-store',
    }
);

// ==================== Hooks 创建 ====================

const { useStore, useSelector, useShallowSelector } = createUseStore(useTodoStore);

export const useTodoState = () => useStore();
export const useTodos = () => useSelector((s) => s.todos);
export const useTodoFilter = () => useSelector((s) => s.filter);
export const useTodoSearchQuery = () => useSelector((s) => s.searchQuery);

// 派生状态 - 过滤后的 todos
const getFilteredTodos: Getter<TodoStore, Todo[]> = (state) => {
    const { todos, filter, searchQuery } = state;

    let filtered = todos;

    // 应用搜索过滤
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (todo) =>
                todo.title.toLowerCase().includes(query) ||
                todo.description?.toLowerCase().includes(query)
        );
    }

    // 应用状态过滤
    if (filter === 'active') {
        return filtered.filter((todo) => !todo.completed);
    }
    if (filter === 'completed') {
        return filtered.filter((todo) => todo.completed);
    }

    return filtered;
};

// 派生状态 - 统计信息
const getTodoStats: Getter<TodoStore, { total: number; active: number; completed: number }> = (
    state
) => {
    const total = state.todos.length;
    const completed = state.todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
};

// 创建 Getter Hook
const createGetter = createGetterHook(useTodoStore);

export const useFilteredTodos = () => createGetter(getFilteredTodos);
export const useTodoStats = () => createGetter(getTodoStats);

// 使用浅比较获取多个值
export const useTodoFilters = () =>
    useShallowSelector((s) => ({ filter: s.filter, searchQuery: s.searchQuery }));

// ==================== 订阅示例 ====================

const todoHelper = createStoreHelper(useTodoStore);

// 订阅特定字段变化
todoHelper.subscribeTo('todos', (todos, prevTodos) => {
    console.log(`Todos changed from ${prevTodos.length} to ${todos.length} items`);
});

// ==================== 使用示例 ====================

/**
 * 组件使用示例:
 *
 * function TodoList() {
 *   const todos = useFilteredTodos();
 *   const { total, active, completed } = useTodoStats();
 *   const { filter, searchQuery } = useTodoFilters();
 *   const { addTodo, toggleTodo, deleteTodo, setFilter, setSearchQuery } = useTodoState();
 *   const [title, setTitle] = useState('');
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     if (title.trim()) {
 *       addTodo(title);
 *       setTitle('');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <h1>Todo List</h1>
 *       <p>Total: {total} | Active: {active} | Completed: {completed}</p>
 *
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={title}
 *           onChange={(e) => setTitle(e.target.value)}
 *           placeholder="Add new todo..."
 *         />
 *         <button type="submit">Add</button>
 *       </form>
 *
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Search todos..."
 *       />
 *
 *       <div>
 *         <button onClick={() => setFilter('all')}>All</button>
 *         <button onClick={() => setFilter('active')}>Active</button>
 *         <button onClick={() => setFilter('completed')}>Completed</button>
 *       </div>
 *
 *       <ul>
 *         {todos.map((todo) => (
 *           <li key={todo.id}>
 *             <input
 *               type="checkbox"
 *               checked={todo.completed}
 *               onChange={() => toggleTodo(todo.id)}
 *             />
 *             <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
 *               {todo.title}
 *             </span>
 *             <button onClick={() => deleteTodo(todo.id)}>Delete</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
