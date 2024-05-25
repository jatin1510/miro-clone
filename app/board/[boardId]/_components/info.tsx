import { Skeleton } from "@/components/ui/skeleton";

const Info = () => {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            TODO: Information about the board
        </div>
    );
};

Info.Skeleton = function InfoSkeleton() {
    return (
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] w-[280px]">
            <Skeleton />
        </div>
    );
};

export default Info;
