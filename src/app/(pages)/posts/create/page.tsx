import type { FC } from 'react';

import { cn } from '@/app/_components/shadcn/utils';

import { PostCreateForm } from './form';
import $styles from './style.module.css';

// 添加动态标记，强制使用 SSR
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

const PostCreatePage: FC = async () => {
    return (
        <div className="page-item">
            <div className={cn($styles.item, 'page-container')}>
                <PostCreateForm />
            </div>
        </div>
    );
};
export default PostCreatePage;
