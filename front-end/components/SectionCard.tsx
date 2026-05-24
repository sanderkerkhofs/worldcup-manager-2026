import { ReactNode } from 'react';

export function SectionCard({ title, children, accent }: { title: string; children: ReactNode; accent?: string; }) {
    return (
        <section className={`section-card ${accent ?? ''}`}>
            <h2>{title}</h2>
            {children}
        </section>
    );
}