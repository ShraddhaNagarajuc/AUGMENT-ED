import { useState } from "react";
import { Hero } from "@/components/Hero";
import { TopicCard } from "@/components/TopicCard";
import { ARCamera } from "@/components/ARCamera";
import { ARModelViewer } from "@/components/ARModelViewer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { InspirationalQuotes } from "@/components/InspirationalQuotes";
import { ProjectMission } from "@/components/ProjectMission";
import { toast } from "sonner";

interface Topic {
  id: string;
  title: string;
  description: string;
  image: string;
  modelPath: string;
  overview?: string;
  keyPoints?: string[];
  references?: { label: string; url: string }[];
}

const topics: Topic[] = [
  {
    id: "earth",
    title: "Planet Earth",
    description: "Explore our planet's structure, atmosphere, and geographical features in 3D",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80",
    modelPath: "/models/Earth2.glb",
    overview: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29.2% of Earth's surface is land consisting of continents and islands. The remaining 70.8% is covered with water, mostly by oceans, seas, gulfs, and other salt-water bodies, but also by lakes, rivers, and other fresh water, which together constitute the hydrosphere.",
    keyPoints: [
      "Circumference: 40,075 km",
      "Age: 4.54 billion years",
      "Atmosphere: 78% Nitrogen, 21% Oxygen",
      "Layers: Crust, Mantle, Outer Core, Inner Core"
    ],
    references: [
      { label: "NASA - Earth Overview", url: "https://science.nasa.gov/earth/facts/" },
      { label: "National Geographic - Earth", url: "https://www.nationalgeographic.com/science/article/earth" }
    ]
  },
  {
    id: "brain",
    title: "Human Brain",
    description: "Explore the human brain anatomy and neural structures in 3D",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    modelPath: "/models/brain.glb",
    overview: "The human brain is the command center of the human nervous system. It receives signals from the body's sensory organs and outputs information to the muscles. The human brain has the same basic structure as other mammal brains, but is larger in relation to body size than any other brain.",
    keyPoints: [
      "Weight: Approx. 1.4 kg",
      "Neurons: ~86 billion",
      "Major Parts: Cerebrum, Cerebellum, Brainstem",
      "Functions: Thought, memory, emotion, touch, motor skills"
    ],
    references: [
      { label: "Johns Hopkins - Brain Anatomy", url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/anatomy-of-the-brain" },
      { label: "NCERT - Neural Control (Class 11)", url: "https://ncert.nic.in/textbook.php?kebo1=21-22" }
    ]
  },
  {
    id: "heart",
    title: "Human Heart",
    description: "Discover the anatomy and function of the cardiovascular system",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    modelPath: "/models/heart.glb",
    overview: "The heart is a muscular organ in most animals, which pumps blood through the blood vessels of the circulatory system. The pumped blood carries oxygen and nutrients to the body, while carrying metabolic waste such as carbon dioxide to the lungs.",
    keyPoints: [
      "Beats per day: ~100,000",
      "Chambers: 4 (2 Atria, 2 Ventricles)",
      "Location: Center of chest, slightly left",
      "Function: Pump oxygenated blood to body"
    ],
    references: [
      { label: "Cleveland Clinic - Heart Anatomy", url: "https://my.clevelandclinic.org/health/body/21704-heart" },
      { label: "NCERT - Body Fluids (Class 11)", url: "https://ncert.nic.in/textbook.php?kebo1=18-22" }
    ]
  }
];

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>(topics);

  const handleSearch = (query: string) => {
    const filtered = topics.filter(topic =>
      topic.title.toLowerCase().includes(query.toLowerCase()) ||
      topic.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTopics(filtered);

    if (filtered.length === 0) {
      toast.error("No topics found. Try 'Earth', 'Brain', or 'Heart'");
    } else {
      toast.success(`Found ${filtered.length} topic(s)`);
    }
  };

  const handleViewAR = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowCamera(true);
  };

  const handleImageRecognized = () => {
    setShowCamera(false);
    setShowModel(true);
  };

  const handleCloseModel = () => {
    setShowModel(false);
    setSelectedTopic(null);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10">
        <Hero onSearch={handleSearch} />

        <section className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Topics</h2>
            <p className="text-muted-foreground">
              Select a topic to view in augmented reality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(topic => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                description={topic.description}
                image={topic.image}
                overview={topic.overview}
                keyPoints={topic.keyPoints}
                references={topic.references}
                onViewAR={() => handleViewAR(topic)}
              />
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground">No topics found</p>
              <p className="text-muted-foreground mt-2">Try searching for different terms</p>
            </div>
          )}
        </section>

        <InspirationalQuotes />
        <ProjectMission />
      </div>

      {showCamera && selectedTopic && (
        <ARCamera
          onClose={() => setShowCamera(false)}
          onImageRecognized={handleImageRecognized}
          topicTitle={selectedTopic.title}
        />
      )}

      {showModel && selectedTopic && (
        <ARModelViewer
          modelPath={selectedTopic.modelPath}
          topicTitle={selectedTopic.title}
          onClose={handleCloseModel}
        />
      )}
    </div>
  );
};

export default Index;
