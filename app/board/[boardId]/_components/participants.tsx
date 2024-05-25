"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "./user-avatar";
import { useOthers, useSelf } from "@/liveblocks.config";
import { connectionIdToColor } from "@/lib/utils";

const MAX_SHOWN_OTHER_USERS = 1;

const Participants = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > MAX_SHOWN_OTHER_USERS;

    return (
        <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
            <div className="flex gap-x-2">
                {users
                    .slice(0, MAX_SHOWN_OTHER_USERS)
                    .map(({ connectionId, info }) => {
                        return (
                            <UserAvatar
                                borderColor={connectionIdToColor(connectionId)}
                                key={connectionId}
                                src={info?.picture}
                                name={info?.name}
                                fallback={info?.name?.[0] || "?"}
                            />
                        );
                    })}

                {currentUser && (
                    <UserAvatar
                        borderColor={connectionIdToColor(
                            currentUser.connectionId
                        )}
                        src={currentUser.info?.picture}
                        name={`${currentUser.info?.name} (You)`}
                        fallback={currentUser.info?.name?.[0] || "?"}
                    />
                )}

                {hasMoreUsers && (
                    <UserAvatar
                        borderColor="black"
                        name={`${users.length - MAX_SHOWN_OTHER_USERS} more`}
                        fallback={`+${users.length - MAX_SHOWN_OTHER_USERS}`}
                    />
                )}
            </div>
        </div>
    );
};

export const ParticipantsSkeleton = () => {
    return (
        <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] w-[110px]">
            <Skeleton />
        </div>
    );
};

export default Participants;
