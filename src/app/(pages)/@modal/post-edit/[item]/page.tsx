import type { FC } from 'react';

import { isNil } from 'lodash';
import { notFound } from 'next/navigation';

import { PageModal } from '@/app/_components/modal/page-modal';

import { PostEditForm } from './form';
import { Metadata, ResolvingMetadata } from 'next';

const PostEditPage: FC<{ params: Promise<{ item: string }> }> = async ({ params }) => {
    const { item } = await params;
    if (isNil(item)) return notFound();

    return (
        <PageModal
            title="编辑文章"
            match={['/post-edit/*']}
            className="min-w-full lg:min-w-[60%]"
        >
            <PostEditForm id={item} />
        </PageModal>
    );
};
export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
    return {
        title: `编辑文章 - ${(await parent).title?.absolute}`,
        description: '文章编辑页面',
    };
};
export default PostEditPage;
