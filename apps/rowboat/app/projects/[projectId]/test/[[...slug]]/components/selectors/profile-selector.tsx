import { WithStringId } from "@/app/lib/types/types";
import { TestProfile } from "@/app/lib/types/testing_types";
import { useCallback, useEffect, useState } from "react";
import { listProfiles } from "@/app/actions/testing_actions";
import { Button } from "@/components/ui/button";
import { Pagination, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { z } from "zod";
import { useRouter } from "next/navigation";

interface ProfileSelectorProps {
    projectId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (profile: WithStringId<z.infer<typeof TestProfile>> | null) => void;
    selectedProfileId?: string;
}

export function ProfileSelector({ projectId, isOpen, onOpenChange, onSelect, selectedProfileId }: ProfileSelectorProps) {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<WithStringId<z.infer<typeof TestProfile>>[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;
    const router = useRouter();

    const fetchProfiles = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await listProfiles(projectId, page, pageSize);
            setProfiles(result.profiles);
            setTotalPages(Math.ceil(result.total / pageSize));
        } catch (error) {
            setError(`Unable to fetch profiles: ${error}`);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (isOpen) {
            fetchProfiles(page);
        }
    }, [page, isOpen, fetchProfiles]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Select a Profile</ModalHeader>
                        <ModalBody>
                            {loading && <div className="flex gap-2 items-center">
                                <Spinner size="sm" />
                                Loading...
                            </div>}
                            {error && <div className="bg-red-100 p-2 rounded-md text-red-800 flex items-center gap-2 text-sm">
                                {error}
                                <Button size="sm" variant="primary" onClick={() => fetchProfiles(page)}>Retry</Button>
                            </div>}
                            {!loading && !error && <>
                                {profiles.length === 0 && <div className="text-gray-600 text-center">No profiles found</div>}
                                {profiles.length > 0 && <div className="flex flex-col w-full">
                                    <div className="grid grid-cols-6 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-sm rounded-t-md">
                                        <div className="col-span-2 px-4 text-gray-700 dark:text-gray-300">Name</div>
                                        <div className="col-span-3 px-4 text-gray-700 dark:text-gray-300">Context</div>
                                        <div className="col-span-1 px-4 text-gray-700 dark:text-gray-300">Mock Tools</div>
                                    </div>

                                    {profiles.map((p) => (
                                        <div 
                                            key={p._id} 
                                            className={`grid grid-cols-6 py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm cursor-pointer transition-colors ${
                                                p._id === selectedProfileId 
                                                    ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800' 
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                onSelect(p);
                                                onClose();
                                            }}
                                        >
                                            <div className="col-span-2 px-4 truncate text-gray-900 dark:text-gray-100">{p.name}</div>
                                            <div className="col-span-3 px-4 truncate text-gray-600 dark:text-gray-400">{p.context}</div>
                                            <div className="col-span-1 px-4 text-gray-600 dark:text-gray-400">{p.mockTools ? "Yes" : "No"}</div>
                                        </div>
                                    ))}
                                </div>}
                                {totalPages > 1 && <Pagination
                                    total={totalPages}
                                    page={page}
                                    onChange={setPage}
                                    className="self-center"
                                />}
                            </>}
                        </ModalBody>
                        <ModalFooter>
                            <div className="flex items-center gap-4 w-full">
                                <div className="flex-1">
                                    <Button 
                                        size="sm" 
                                        variant="primary"
                                        onClick={() => router.push(`/projects/${projectId}/test/profiles`)}
                                    >
                                        Manage Profiles
                                    </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedProfileId && (
                                        <Button 
                                            size="sm" 
                                            variant="tertiary"
                                            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                                            onClick={() => {
                                                onSelect(null);
                                                onClose();
                                            }}
                                        >
                                            Clear Selection
                                        </Button>
                                    )}
                                    <Button size="sm" variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
} 