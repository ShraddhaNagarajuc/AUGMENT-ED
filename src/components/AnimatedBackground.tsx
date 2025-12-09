import { Rocket, Atom, Brain, Globe, Microscope, Dna, GraduationCap, Telescope } from "lucide-react";
import { useEffect, useState } from "react";

const icons = [
    Rocket, Atom, Brain, Globe, Microscope, Dna, GraduationCap, Telescope
];

interface FloatingIcon {
    id: number;
    Icon: any;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    rotation: number;
}

export const AnimatedBackground = () => {
    const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);

    useEffect(() => {
        // Generate random particles
        const newIcons = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            Icon: Rocket, // Unused but kept for type safety or simplify type if needed. Actually let's just use a div circle.
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2, // Small stars 2-6px
            duration: Math.random() * 100 + 50, // Very slow float
            delay: Math.random() * -50,
            rotation: 0
        }));
        setFloatingIcons(newIcons);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {floatingIcons.map(({ id, x, y, size, duration, delay }) => (
                <div
                    key={id}
                    className="absolute bg-white rounded-full opacity-30 animate-pulse"
                    style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animation: `float ${duration}s infinite linear`,
                        animationDelay: `${delay}s`,
                        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.2)`
                    }}
                />
            ))}
        </div>
    );
};
