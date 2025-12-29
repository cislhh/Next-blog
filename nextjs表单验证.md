# React 表单验证学习笔记

## 一、整体架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          表单验证完整流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  用户输入 ──▶ react-hook-form ──▶ zodResolver ──▶ Zod Schema ──▶ 验证结果  │
│              (useForm)            (桥接器)        (验证规则)                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        核心文件职责                                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  types.ts           → 定义表单数据类型                               │   │
│  │  form-validator.ts  → 定义 Zod 验证规则                              │   │
│  │  hooks.ts           → 组装表单状态和验证逻辑                          │   │
│  │  actions/post.ts    → 数据库操作（slug 唯一性验证）                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、核心概念

### 2.1 为什么要用这三件套？

| 技术 | 作用 | 为什么需要 |
|------|------|-----------|
| **react-hook-form** | 管理表单状态、减少重渲染 | 原生表单代码繁琐，状态管理复杂 |
| **zod** | 定义验证规则、类型推导 | 验证逻辑集中管理，TypeScript 类型自动推导 |
| **zodResolver** | 连接上述两者 | 让 react-hook-form 能理解 Zod 的验证规则 |

### 2.2 验证时机

```typescript
mode: 'all'  // onBlur + onChange 双重验证
```

---

## 三、代码详解

### 3.1 types.ts - 类型定义

```typescript
// 文件: src/app/_components/post/types.ts

// ========== 表单组件 Props ==========
// 创建模式
interface PostCreateFormProps {
    type: 'create';
    setPedding?: (value: boolean) => void;
}

// 更新模式
interface PostUpdateFormProps {
    type: 'update';
    item: Post;  // 原数据，用于回填表单
}

// 联合类型：二选一
type PostActionFormProps = PostCreateFormProps | PostUpdateFormProps;

// ========== 表单数据类型 ==========
// 关键点：PostFormData 类型是从 Zod Schema 自动推导出来的！
type PostFormData = z.infer<ReturnType<typeof generatePostFormValidator>>;
//        ↑                  ↑           ↑                    ↑
//     最终类型          推导工具      取类型          生成验证器的返回值
```

**重点理解**：`PostFormData` 不需要手写，它完全由 `generatePostFormValidator` 中的 Zod 定义自动生成。这意味着验证规则和类型定义永远保持同步！

---

### 3.2 form-validator.ts - 验证规则

```typescript
// 文件: src/app/_components/post/form-validator.ts

import { z } from 'zod';
import { queryPostItemBySlug } from '@/app/actions/post';

// ========== slug 唯一性验证 ==========
export const uniqueValidator = (id?: string) => async (val?: string) => {
    // 步骤1: 空值跳过验证
    if (isNil(val) || !val.length) return true;

    // 步骤2: 查询数据库
    const post = await queryPostItemBySlug(val);

    // 步骤3: 判断是否唯一
    // - 没找到 → 唯一 ✅
    // - 找到了但是自己 → 唯一 ✅
    // - 找到了且是别人 → 不唯一 ❌
    if (isNil(post) || post.id === id) return true;
    return false;  // 触发错误提示
};

// ========== 生成完整的表单验证规则 ==========
export const generatePostFormValidator = (id?: string) => {
    const slugUnique = uniqueValidator(id);  // 传入当前文章ID，更新时排除自己

    return z
        .object({
            // 每个字段 = 类型检查 + 长度验证 + 错误提示
            title: z.string().min(1, { message: '标题不得少于1个字符' })
                           .max(200, { message: '标题不得超过200个字符' }),

            body: z.string().min(1, { message: '内容不得少于1个字符' }),

            summary: z.string().max(300, { message: '摘要不得超过300个字符' })
                              .optional(),  // 可选字段

            slug: z.string()
                     .max(250, { message: 'slug不得超过250个字符' })
                     .optional()
                     .refine(slugUnique, {  // 自定义异步验证
                         message: 'slug必须是唯一的,请重新设置',
                     }),

            keywords: z.string().max(200, { message: '关键词不得超过200个字符' })
                               .optional(),

            description: z.string().max(300, { message: '描述不得超过300个字符' })
                                 .optional(),
        })
        .strict();  // 严格模式：不允许对象包含未定义的字段
};
```

**Zod 常用方法速查**：

| 方法 | 作用 | 示例 |
|------|------|------|
| `.string()` | 必须是字符串 | `z.string()` |
| `.min(n)` | 最小长度 | `z.string().min(5)` |
| `.max(n)` | 最大长度 | `z.string().max(100)` |
| `.optional()` | 可选字段 | `z.string().optional()` |
| `.refine(fn)` | 自定义验证 | `.refine(async val => await check(val))` |
| `.strict()` | 严格模式（无额外字段） | `z.object({...}).strict()` |

---

### 3.3 actions/post.ts - 数据库验证

```typescript
// 文件: src/app/actions/post.ts

/**
 * 根据slug查询文章信息
 * @param slug
 */
export const queryPostItemBySlug = async (slug: string): Promise<Post | null> => {
    const item = await db.post.findUnique({ where: { slug } });
    return item;
};
```

**作用**：为 `uniqueValidator` 提供数据库查询能力，验证 slug 是否已被使用。

---

### 3.4 hooks.ts - 组装表单状态

```typescript
// 文件: src/app/_components/post/hooks.ts

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDefaultFormValues } from '@/libs/form';
import { generatePostFormValidator } from './form-validator';

export const usePostActionForm = (
    params: { type: 'create' } | { type: 'update'; item: Post }
) => {
    // ========== 步骤1: 生成默认值 ==========
    const defaultValues = useMemo(() => {
        return getDefaultFormValues<Post, PostFormData>(
            ['title', 'body', 'summary', 'slug', 'keywords', 'description'],
            params,
        );
    }, [params.type]);

    // ========== 步骤2: 返回表单实例 ==========
    return useForm<PostFormData>({
        mode: 'all',  // onChange + onBlur 都触发验证
        resolver: zodResolver(  // 将 Zod 验证规则转换为 react-hook-form 可用的格式
            generatePostFormValidator(params.type === 'update' ? params.item.id : undefined)
        ),
        defaultValues,  // 表单初始值
    });
};
```

---

### 3.5 libs/form.ts - 默认值工具

```typescript
// 文件: src/libs/form.ts

export const getDefaultFormValues = <
    T extends Record<string, any>,  // 原始数据类型
    R extends Record<string, any>   // 返回的表单数据类型
>(
    fields: Array<keyof T>,         // 需要提取的字段列表
    params: { type: 'create' } | { type: 'update'; item: T },
) => {
    const item = {} as T;

    // 更新模式：从原数据中提取指定字段
    if (params.type === 'update') {
        for (const field of fields) {
            if (field in params.item) {
                item[field] = params.item[field];
            }
        }
    }

    // 最终值：更新时用原数据，创建时用空字符串
    const data = fields.reduce(
        (acc, field) => {
            acc[field] = params.type === 'update' && !isNil(acc[field])
                ? acc[field]   // 更新：保留原值
                : '';          // 创建：空字符串
            return acc;
        },
        item as Record<keyof T, any>,
    ) as R;

    return data;
};
```

---

## 四、完整数据流转图

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          创建文章表单流程                                     │
└────────────────────────────────────────────────────────────────────────────┘

用户组件
   │
   │ 调用 usePostActionForm({ type: 'create' })
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  hooks.ts ─────────────────────────────────────────────────────────────────  │
│  ├─ getDefaultFormValues()     → defaultValues = { title: '', body: '', ... } │
│  ├─ generatePostFormValidator() → Zod Schema (id = undefined)               │
│  └─ useForm({ resolver, defaultValues }) → 返回表单实例                      │
└─────────────────────────────────────────────────────────────────────────────┘
   │
   │ 返回 { register, formState: { errors }, handleSubmit, ... }
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  用户表单组件 ─────────────────────────────────────────────────────────────  │
│  ├─ <input {...register('title')} />                                        │
│  ├─ {errors.title && <span>{errors.title.message}</span>}                   │
│  └─ <form onSubmit={handleSubmit(onSubmit)}>                               │
└─────────────────────────────────────────────────────────────────────────────┘
   │
   │ 用户输入触发验证 (mode: 'all')
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  zodResolver ──────────────────────────────────────────────────────────────  │
│  └─ 将用户输入交给 Zod Schema 验证                                          │
└─────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Zod Schema 验证 ──────────────────────────────────────────────────────────  │
│  ├─ title: string → 检查长度 1-200                                          │
│  ├─ body: string  → 检查长度 ≥1                                             │
│  └─ slug: string  → 检查长度 + 调用 uniqueValidator() 查数据库               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  uniqueValidator()  →  queryPostItemBySlug()  →  Prisma 数据库查询   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
   │
   │ 验证通过 ✅ / 失败 ❌
   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  表单状态更新                                                               │
│  ├─ errors.title?.message  → "标题不得少于1个字符"                           │
│  └─ isValid → true / false                                                 │
└─────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────┐
│                          更新文章表单流程（区别点）                           │
└────────────────────────────────────────────────────────────────────────────┘

调用 usePostActionForm({ type: 'update', item: post })
   │
   ├─ defaultValues = { title: post.title, body: post.body, ... }  // 回填原数据
   │
   └─ generatePostFormValidator(post.id)  // 传入当前ID，验证slug时排除自己
```

---

## 五、关键知识点总结

### 5.1 类型安全链

```
Zod Schema 定义 → z.infer<> 推导类型 → PostFormData → useForm<PostFormData>
     ↑                                                           ↓
     └─────────────────────── 类型永远一致 ───────────────────────┘
```

### 5.2 更新模式的核心逻辑

当更新文章时，slug 验证需要排除自己：

```typescript
// 创建文章：slug 不能与任何文章重复
generatePostFormValidator()  // id = undefined

// 更新文章：slug 可以与当前文章的 slug 相同
generatePostFormValidator(post.id)  // id = "当前文章ID"
```

验证逻辑：
```typescript
if (isNil(post) || post.id === id) return true;  // 找到的是自己 → 通过
```

### 5.3 验证时机选择

| mode | 触发时机 | 适用场景 |
|------|---------|---------|
| `onSubmit` | 提交时 | 简单表单，减少验证开销 |
| `onBlur` | 失焦时 | 需要即时反馈但不频繁验证 |
| `onChange` | 输入时 | 实时验证 |
| `all` | onBlur + onChange | 体验最好，推荐使用 |

### 5.4 useForm 返回的常用方法

```typescript
const {
    register,      // 注册表单字段：{ ...register('title') }
    formState,     // 表单状态：{ errors, isValid, isDirty, ... }
    handleSubmit,  // 提交处理：handleSubmit(onSubmit)
    setValue,      // 手动设置值：setValue('title', '新标题')
    getValues,     // 获取所有值：getValues()
    reset,         // 重置表单：reset(defaultValues)
} = useForm();
```
