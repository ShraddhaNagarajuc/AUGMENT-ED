import { Target, Lightbulb, Users } from "lucide-react";

export const ProjectMission = () => {
    return (
        <div className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                        Revolutionizing Education
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Our mission is to bridge the gap between traditional learning and modern technology,
                        making complex concepts accessible to everyone through the power of Augmented Reality.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-card border hover:border-primary/50 transition-all hover:shadow-glow group">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Immersive Learning</h3>
                        <p className="text-muted-foreground">
                            Transforming static textbooks into interactive 3D experiences that engage all senses and improve retention.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border hover:border-primary/50 transition-all hover:shadow-glow group">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Lightbulb className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Concept Clarity</h3>
                        <p className="text-muted-foreground">
                            Visualizing abstract concepts with detailed models to build a strong foundational understanding.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border hover:border-primary/50 transition-all hover:shadow-glow group">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Accessible to All</h3>
                        <p className="text-muted-foreground">
                            Making high-quality educational tools available on any device with a camera, anywhere in the world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
