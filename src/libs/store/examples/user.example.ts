/**
 * Zustand Store 使用示例 - User 用户管理
 *
 * 演示功能:
 * - 异步状态管理
 * - Hybrid Store 使用
 * - 持久化存储
 * - 加载和错误处理
 */

import type { AsyncAction } from '../types';

import { createPersistStore, createHybridStore, wrapAsyncOperation } from '../base';
import { createHybridHook, createUseStore } from '../hooks';

// ==================== 类型定义 ====================

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
}

// ==================== 方式一：使用 createPersistStore ====================

const initialUserState: UserState = {
    user: null,
    isAuthenticated: false,
};

interface UserActions {
    login: AsyncAction<UserState, [email: string, password: string]>;
    logout: Action<UserState>;
    updateProfile: AsyncAction<UserState, [data: Partial<User>]>;
    fetchUser: AsyncAction<UserState, [userId: string]>;
}

type UserStore = UserState & UserActions;

// 模拟 API 调用
const api = {
    async login(email: string, password: string): Promise<User> {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            id: '1',
            name: 'Test User',
            email,
            avatar: '/avatar.png',
        };
    },
    async fetchUser(userId: string): Promise<User> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            id: userId,
            name: 'Fetched User',
            email: 'fetched@example.com',
        };
    },
    async updateProfile(userId: string, data: Partial<User>): Promise<User> {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
            id: userId,
            name: data.name ?? 'Updated User',
            email: data.email ?? 'updated@example.com',
            avatar: data.avatar,
        };
    },
};

const userActions: UserActions = {
    async login(email, password) {
        const user = await api.login(email, password);
        this.setState({ user, isAuthenticated: true });
    },
    logout() {
        this.setState({ user: null, isAuthenticated: false });
    },
    async updateProfile(data) {
        const state = this.getState();
        if (!state.user) throw new Error('User not logged in');
        const updatedUser = await api.updateProfile(state.user.id, data);
        this.setState({ user: updatedUser });
    },
    async fetchUser(userId) {
        const user = await api.fetchUser(userId);
        this.setState({ user, isAuthenticated: true });
    },
};

export const useUserStore = createPersistStore(
    { ...initialUserState, ...userActions } as UserStore,
    {
        name: 'user-store',
        persistOptions: {
            name: 'user-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            } as Partial<UserStore>),
        },
    }
);

// 创建 hooks
const { useStore: useUserStoreBase, useSelector: useUserSelector } = createUseStore(useUserStore);

export const useUser = () => useUserStoreBase();
export const useUserProfile = () => useUserSelector((s) => s.user);
export const useIsAuthenticated = () => useUserSelector((s) => s.isAuthenticated);

// ==================== 方式二：使用 createHybridStore ====================

export const userHybridStore = createHybridStore(initialUserState, {
    name: 'user-hybrid-store',
});

// 添加 actions
userHybridStore.setState({
    login: async function (email: string, password: string) {
        await wrapAsyncOperation(
            userHybridStore,
            async () => {
                const user = await api.login(email, password);
                const currentState = userHybridStore.getState();
                userHybridStore.setState({
                    data: { ...currentState.data, user, isAuthenticated: true },
                });
                return user;
            }
        );
    },
    logout: function () {
        userHybridStore.setState({
            data: { user: null, isAuthenticated: false },
            _error: null,
        });
    },
} as Partial<typeof userHybridStore.getState()>);

// 创建 Hybrid hooks
const { useData, useLoading, useError } = createHybridHook(userHybridStore);

export const useUserData = () => useData();
export const useUserLoading = () => useLoading();
export const useUserError = () => useError();

// ==================== 使用示例 ====================

/**
 * 组件使用示例:
 *
 * function UserProfile() {
 *   const user = useUserProfile();
 *   const isAuthenticated = useIsAuthenticated();
 *   const { login, logout } = useUser();
 *   const [isLoading, setIsLoading] = useState(false);
 *
 *   const handleLogin = async () => {
 *     setIsLoading(true);
 *     try {
 *       await login('user@example.com', 'password');
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={handleLogin}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.name}</h1>
 *       <p>{user?.email}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 *
 * // 使用 Hybrid Store
 * function UserProfileWithHybrid() {
 *   const { user, isAuthenticated } = useUserData();
 *   const isLoading = useUserLoading();
 *   const error = useUserError();
 *   const store = userHybridStore.getState();
 *
 *   return (
 *     <div>
 *       {isLoading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       {isAuthenticated && user && (
 *         <div>
 *           <h1>{user.name}</h1>
 *           <p>{user.email}</p>
 *           <button onClick={() => store.logout?.()}>Logout</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
