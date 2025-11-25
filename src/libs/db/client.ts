/* eslint-disable vars-on-top */

import { PrismaClient } from '~/node_modules/.prisma/client';
import paginateExt from 'prisma-paginate';

const prismaClientSingleton = () => {
    return new PrismaClient().$extends(paginateExt);
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
