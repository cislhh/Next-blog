'use client';

import { isNil, trim } from 'lodash';
import {
    ChangeEventHandler,
    forwardRef,
    MouseEventHandler,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

import type { PostActionFormProps, PostCreateFormRef } from './types';

import { Details } from '../collapsible/details';
import { Button } from '../shadcn/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../shadcn/ui/form';
import { Input } from '../shadcn/ui/input';
import { Textarea } from '../shadcn/ui/textarea';
import { usePostActionForm, usePostFormSubmitHandler } from './hooks';
import Link from 'next/link';
import { generateLowerString } from '@/libs/utils';

export const PostActionForm = forwardRef<PostCreateFormRef, PostActionFormProps>((props, ref) => {
    const form = usePostActionForm(
        props.type === 'create' ? { type: props.type } : { type: props.type, item: props.item },
    );

    const submitHandler = usePostFormSubmitHandler(
        props.type === 'create' ? { type: 'create' } : { type: 'update', id: props.item.id },
    );

    const [slug, setSlug] = useState(props.type === 'create' ? '' : props.item?.slug || '');

    const changeSlug: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setSlug(e.target?.value);
    }, []);

    const generateTitleSlug: MouseEventHandler<HTMLAnchorElement> = useCallback((e)=>{
        e.preventDefault();
        if(!form.formState.isSubmitting){
            const title = trim(form.getValues('title'),'');
            if(title) setSlug(generateLowerString(title))
        }
    },[form.formState.isSubmitting])

    useEffect(() => {
        if (props.type === 'create' && !isNil(props.setPedding))
            props.setPedding(form.formState.isSubmitting);
    }, [form.formState.isSubmitting]);
    useEffect(() => {
        form.setValue('slug', slug);
    }, [slug]);

    useImperativeHandle(
        ref,
        () =>
            props.type === 'create'
                ? {
                      create: form.handleSubmit(submitHandler),
                  }
                : {},
        [props.type],
    );

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(submitHandler)}
                className="flex flex-auto flex-col space-y-8"
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>文章标题</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="请输入标题"
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Details summary="可选字段">
                    {/* 摘要简述 */}
                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem className="mt-2 border-b border-dashed pb-1">
                                <FormLabel>摘要简述</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="请输入文章摘要"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>摘要会显示在文章列表页</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* 唯一URL */}
                    <div className="mt-2 border-b border-dashed pb-1">
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormLabel>唯一URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={slug}
                                            onChange={changeSlug}
                                            placeholder="请输入唯一URL"
                                            disabled={form.formState.isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        如果留空,则文章访问地址是id
                                        <Link
                                            className="ml-5 mr-1 text-black dark:text-white"
                                            href="#"
                                            onClick={generateTitleSlug}
                                            aria-disabled={form.formState.isSubmitting}
                                        >
                                            [点此]
                                        </Link>
                                        自动生成slug(根据标题使用&apos;-&apos;连接字符拼接而成,中文字自动转换为拼音)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* 关键字 */}
                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem className="mt-2 border-b border-dashed pb-1">
                                <FormLabel>关键字</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="请输入关键字,用逗号分割(关键字是可选的)"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>
                                    关键字不会显示,仅在SEO时发挥作用.每个关键字之间请用英文逗号(,)分割
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* 文章描述 */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="mt-2 border-b border-dashed pb-1">
                                <FormLabel>文章描述</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="请输入文章描述"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>
                                    文章描述不会显示,仅在SEO时发挥作用
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Details>
                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>文章内容</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="请输入内容"
                                    {...field}
                                    className="min-h-80"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {props.type === 'update' && (
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? '更新中...' : '保存'}
                    </Button>
                )}
            </form>
        </Form>
    );
});
