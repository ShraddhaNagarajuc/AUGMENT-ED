import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

const quotes = [
    {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Dr. APJ Abdul Kalam",
        role: "Former President of India"
    },
    {
        text: "The end-product of education should be a free creative man, who can battle against historical circumstances and adversities of nature.",
        author: "Dr. Sarvepalli Radhakrishnan",
        role: "Former President of India"
    },
    {
        text: "Swaraj is my birthright and I shall have it.",
        author: "Bal Gangadhar Tilak",
        role: "Indian Nationalist"
    },
    {
        text: "Arise, awake, and stop not till the goal is reached.",
        author: "Swami Vivekananda",
        role: "Indian Philosopher"
    },
    {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Mahatma Gandhi",
        role: "Father of the Nation"
    }
];

export const InspirationalQuotes = () => {
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000); // Change quote every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="py-16 bg-muted/30 relative">
            <div className="container mx-auto px-4 text-center">
                <Quote className="w-12 h-12 mx-auto text-primary mb-6 opacity-30" />

                <div className="max-w-3xl mx-auto h-[150px] relative">
                    {quotes.map((quote, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 flex flex-col items-center justify-center ${index === currentQuote ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                        >
                            <p className="text-2xl md:text-3xl font-medium mb-4 italic text-foreground/90">
                                "{quote.text}"
                            </p>
                            <div className="space-y-1">
                                <p className="font-semibold text-primary">{quote.author}</p>
                                <p className="text-sm text-muted-foreground">{quote.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mt-8">
                    {quotes.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuote(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentQuote ? "bg-primary w-6" : "bg-primary/20 hover:bg-primary/50"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
