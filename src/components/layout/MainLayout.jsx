import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout({ children, title, subtitle, actions }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} subtitle={subtitle} actions={actions} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
