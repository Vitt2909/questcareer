'use client';

interface ExternalCoursePageProps {
    url: string;
    title: string;
    provider: string;
    platformLogo?: string;
}

export function ExternalCoursePage({ url, title, provider, platformLogo }: ExternalCoursePageProps) {
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                {platformLogo && (
                    <img src={platformLogo} alt={provider} className="w-8 h-8 rounded" />
                )}
                <div>
                    <h3 className="font-medium text-white">{title}</h3>
                    <p className="text-sm text-gray-400">{provider}</p>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
                Acessar Curso ↗
            </a>
        </div>
    );
}
