import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

export const DetailTopNav = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="w-full flex items-center justify-between pb-4">
            <Button isIconOnly radius="full" variant="flat" className="bg-zinc-900 text-zinc-400" onPress={onBack}>
                <ArrowLeft size={20} />
            </Button>
            <div className="flex-1" />
        </div>
    );
};
