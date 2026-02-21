export default function QuestPage({
    params,
}: {
    params: { questId: string };
}) {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Quest</h1>
            <p className="text-gray-400">Quest ID: {params.questId}</p>
            {/* TODO: Load quest content, YouTube player or external course page */}
        </div>
    );
}
