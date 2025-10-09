import type { FC } from 'react';

import { SimplePaginate } from '@/app/_components/paginate/simple';
import { queryPostTotalPages } from '@/app/actions/post';

export const PostListPaginate: FC<{ limit: number; page: number }> = async ({ limit, page }) => {
    const totalPages = await queryPostTotalPages(limit);
    return (
        <div className="mb-5 w-full flex-none">
            <SimplePaginate totalPages={totalPages} currentPage={page} />
        </div>
    );
};
