import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-200">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300">
                {children}
            </main>
        </div>
    )
}
