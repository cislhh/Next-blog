import type { FC } from 'react';

import Link from 'next/link';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '../shadcn/ui/navigation-menu';
import { cn } from '../shadcn/utils';
import $styles from './nav.module.css';
import { House } from 'lucide-react';

const items = [
    {
        title: '首页',
        href: '/',
        icon:House
    },
];

/**
 * 桌面端导航栏
 */
export const HeaderNav: FC = () => {
    return (
        <div className={$styles.nav}>
            <NavigationMenu className={$styles.menus}>
                <NavigationMenuList>
                    {items.map((item) => {
                        return (
                            <NavigationMenuItem
                                key={item.href}
                                className={cn($styles['menu-item'])}
                            >
                                <Link href={item.href} passHref>
                                    <NavigationMenuLink
                                        className={cn(navigationMenuTriggerStyle())}
                                    >
                                        {item.icon && <item.icon className="mr-1"></item.icon>}
                                        {item.title}
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
};


/**
 * 平板和移动端导航栏
 */

export const MobileNav: FC = ()=>{
    return (
        <div className={$styles.mobileNav}>
            <ul>
                {items.map((item)=>{
                    return (
                        <li key={item.href}>
                            {item.icon && <item.icon className='tw:mr-2'></item.icon>}
                            <Link href={item.href}>{item.title}</Link>
                        </li>
                    )
                })}
            </ul>
        </div>

    )
}