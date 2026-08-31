'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";
import NavItems from "@/components/NavItems";

const UserDropdown = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        router.push("/sign-in");
    }

    // ADDED: Storing the image URL directly in the user object
    const user = {
        name: 'Oscar Piastri',
        email: 'oscar.piastri@mclaren.com',
        image: 'https://th.bing.com/th/id/OIP.Kd47ZLVxDV2lgn-TXHJHgwHaGH?w=210&h=180&c=7&r=0&o=7&dpr=1.9&pid=1.7&rm=3'
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-md text-gray-400 hover:text-purple-400 hover:bg-gray-600 focus:outline-none transition-colors">
                <Avatar className="h-8 w-8">
                    {/* FIXED: Referencing the unified user.image */}
                    <AvatarImage src={user.image}/>
                    <AvatarFallback className="bg-purple-400 text-purple-800 text-sm font-bold">
                        {user.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className='text-base font-medium text-inherit'>
                        {user.name}
                    </span>
                </div>
            </DropdownMenuTrigger>

            {/* FIXED: Added bg-zinc-950 and border-zinc-800 to make it dark */}
            <DropdownMenuContent className="w-64 bg-zinc-800 border-zinc-900 text-gray-400">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        <div className="flex relative items-center gap-3 px-2 py-2">
                            <Avatar className="h-10 w-10 shrink-0">
                                {/* FIXED: Referencing the same unified user.image */}
                                <AvatarImage src={user.image}/>
                                <AvatarFallback className="bg-purple-400 text-purple-800 text-sm font-bold">
                                    {user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className='text-base font-medium text-gray-300 truncate'>
                                    {user.name}
                                </span>
                                <span className="text-sm text-gray-500 truncate">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-gray-800"/>

                <DropdownMenuItem
                    onClick={handleSignOut}
                    // 1. Add 'group' to the parent container
                    className="group flex items-center text-gray-300 text-md font-medium hover:text-purple-400 focus:bg-zinc-800 focus:text-purple-400 transition-colors cursor-pointer">

                    {/* 2. Explicitly target the icon with group-hover and group-focus */}
                    <LogOut className="h-4 w-4 mr-2 hidden sm:block text-gray-300 group-hover:text-purple-400 group-focus:text-purple-400 transition-colors" />

                    Logout
                </DropdownMenuItem>
                <DropdownMenuSeparator className="hidden sm:block bg-gray-800"/>

                <nav className="sm:hidden">
                    <NavItems/>
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown