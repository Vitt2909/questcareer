'use client';

interface YouTubePlayerProps {
    videoId: string;
    title?: string;
}

export function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
    return (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={title ?? 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            />
        </div>
    );
}
