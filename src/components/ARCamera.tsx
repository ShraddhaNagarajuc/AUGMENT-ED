import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

interface ARCameraProps {
  onClose: () => void;
  onImageRecognized: (imageData: string) => void;
  topicTitle: string;
}

export const ARCamera = ({ onClose, onImageRecognized, topicTitle }: ARCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [model, setModel] = useState<any | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  useEffect(() => {
    startCamera();
    loadModel();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      setIsModelLoading(false);
      toast.success("AI model loaded successfully!");
    } catch (error) {
      console.error("Error loading MobileNet model:", error);
      setIsModelLoading(false);
      toast.error("Failed to load AI model. Using fallback recognition.");
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }

      toast.success("Camera ready! Point at your textbook");
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const hasSignificantContent = (imageData: ImageData): boolean => {
    const data = imageData.data;
    let totalVariance = 0;
    let avgR = 0, avgG = 0, avgB = 0;
    const totalPixels = data.length / 4;

    // Calculate average color
    for (let i = 0; i < data.length; i += 4) {
      avgR += data[i];
      avgG += data[i + 1];
      avgB += data[i + 2];
    }
    avgR /= totalPixels;
    avgG /= totalPixels;
    avgB /= totalPixels;

    // Calculate variance
    for (let i = 0; i < data.length; i += 4) {
      totalVariance += Math.pow(data[i] - avgR, 2);
      totalVariance += Math.pow(data[i + 1] - avgG, 2);
      totalVariance += Math.pow(data[i + 2] - avgB, 2);
    }
    totalVariance /= (totalPixels * 3);

    const standardDeviation = Math.sqrt(totalVariance);
    console.log(`Image variance: ${standardDeviation.toFixed(2)}`);

    // If variance is very low, image is blank/uniform
    return standardDeviation > 20;
  };

  const analyzeColorForEarth = (imageData: ImageData): { match: boolean; confidence: number; detected: string } => {
    const data = imageData.data;
    let blueCount = 0;
    let greenCount = 0;
    const totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;
      if (brightness < 30 || brightness > 240) continue;

      // Detect blue (for Earth - oceans)
      if (b > r + 30 && b > g + 20 && b > 80) {
        blueCount++;
      }

      // Detect green (for Earth - land)
      if (g > r + 20 && g > b + 20 && g > 60) {
        greenCount++;
      }
    }

    const bluePercent = (blueCount / totalPixels) * 100;
    const greenPercent = (greenCount / totalPixels) * 100;
    const earthScore = bluePercent + greenPercent * 0.5;
    const isEarth = bluePercent > 8;

    return {
      match: isEarth,
      confidence: Math.min(earthScore, 100),
      detected: `Blue: ${bluePercent.toFixed(1)}%, Green: ${greenPercent.toFixed(1)}%`
    };
  };

  const detectEdgesAndShapes = (imageData: ImageData): { edgeDensity: number; roundness: number; complexity: number } => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let edgeCount = 0;
    let centerMass = { x: 0, y: 0, count: 0 };

    // Convert to grayscale and detect edges using Sobel operator
    const edges: boolean[][] = [];
    for (let y = 1; y < height - 1; y++) {
      edges[y] = [];
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        // Get surrounding pixels
        const grayRight = 0.299 * data[idx + 4] + 0.587 * data[idx + 5] + 0.114 * data[idx + 6];
        const grayDown = 0.299 * data[idx + width * 4] + 0.587 * data[idx + width * 4 + 1] + 0.114 * data[idx + width * 4 + 2];

        const gradient = Math.abs(gray - grayRight) + Math.abs(gray - grayDown);

        if (gradient > 25) {
          edges[y][x] = true;
          edgeCount++;
          centerMass.x += x;
          centerMass.y += y;
          centerMass.count++;
        } else {
          edges[y][x] = false;
        }
      }
    }

    const edgeDensity = edgeCount / (width * height);

    // Calculate shape roundness (for brain vs heart distinction)
    if (centerMass.count > 0) {
      centerMass.x /= centerMass.count;
      centerMass.y /= centerMass.count;
    }

    // Calculate distances from center to edges
    let totalDistance = 0;
    let varianceDistance = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edges[y] && edges[y][x]) {
          const dist = Math.sqrt(Math.pow(x - centerMass.x, 2) + Math.pow(y - centerMass.y, 2));
          totalDistance += dist;
        }
      }
    }

    const avgDistance = centerMass.count > 0 ? totalDistance / centerMass.count : 0;

    // Calculate variance in distances (more uniform = more round)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edges[y] && edges[y][x]) {
          const dist = Math.sqrt(Math.pow(x - centerMass.x, 2) + Math.pow(y - centerMass.y, 2));
          varianceDistance += Math.pow(dist - avgDistance, 2);
        }
      }
    }

    const stdDev = centerMass.count > 0 ? Math.sqrt(varianceDistance / centerMass.count) : 0;
    const roundness = avgDistance > 0 ? 1 - (stdDev / avgDistance) : 0;

    // Calculate complexity (number of distinct edge regions)
    let complexity = edgeDensity * 100;

    return { edgeDensity, roundness, complexity };
  };

  const analyzeShapeForBrain = (imageData: ImageData): { match: boolean; confidence: number; detected: string } => {
    const data = imageData.data;
    const totalPixels = data.length / 4;

    // Check for reddish-pink colors (brain tissue) OR high contrast (diagrams)
    let organColorCount = 0;
    let highContrastCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness < 20 || brightness > 250) continue; // Skip extreme dark/light

      // Extended Brain colors: pinkish, reddish, skin tones, OR just gray/white (for diagrams)
      // Relaxed red/pink detection
      if ((r > 100 && r > g && r > b) || // Any dominant red
        (r > 120 && g > 100 && b > 100 && r > b) || // Skin tones
        // Also count grayscale-ish pixels that might be in a B&W textbook diagram
        (Math.abs(r - g) < 20 && Math.abs(r - b) < 20 && Math.abs(g - b) < 20 && brightness > 50 && brightness < 230)) {
        organColorCount++;
      }

      // Check for high contrast boundaries (simple check) - useful for line drawings
      if (brightness < 100 || brightness > 200) {
        highContrastCount++;
      }
    }

    const organColorPercent = (organColorCount / totalPixels) * 100;

    // Detect shape characteristics
    const shape = detectEdgesAndShapes(imageData);

    console.log(`Brain analysis - Color/Valid: ${organColorPercent.toFixed(1)}%, Edges: ${(shape.edgeDensity * 100).toFixed(1)}%, Roundness: ${(shape.roundness * 100).toFixed(1)}%, Complexity: ${shape.complexity.toFixed(1)}`);

    // Relaxed Brain characteristics:
    // - ANY reasonable edge density (wrinkles/folds OR line drawing) -> widened range
    // - Low requirement for color (1% is enough to say "not empty noise")
    // - Complexity can be lower (simple diagrams)
    const isBrain = organColorPercent > 1 &&
      shape.edgeDensity > 0.05 &&
      shape.edgeDensity < 0.6 && // Allow higher density (busy diagrams) 
      shape.complexity > 5;      // Lower complexity threshold

    // Boost confidence if we have good edges (folds) even if color is off
    let confidence = Math.min(organColorPercent + shape.complexity * 2 + (shape.edgeDensity * 100), 100);

    // If it looks like a brainy shape (complex edges), boost confidence even more
    if (shape.edgeDensity > 0.1 && shape.complexity > 8) {
      confidence = Math.max(confidence, 60); // Ensure at least 60% confidence for complex shapes
    }

    return {
      match: isBrain,
      confidence,
      detected: `Features: ${organColorPercent.toFixed(1)}%, Complexity: ${shape.complexity.toFixed(1)}, Edges: ${(shape.edgeDensity * 100).toFixed(1)}%`
    };
  };

  const analyzeShapeForHeart = (imageData: ImageData): { match: boolean; confidence: number; detected: string } => {
    const data = imageData.data;
    const totalPixels = data.length / 4;

    // Count specifically RED pixels with very strict criteria
    let brightRedPixels = 0;  // Bright pure red
    let darkRedPixels = 0;     // Dark/maroon red
    let bluePixels = 0;
    let skinTonePixels = 0;    // To exclude random skin/objects

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      // Skip very dark or very bright pixels
      if (brightness < 30 || brightness > 240) continue;

      // Bright red detection (like fresh blood, heart muscle)
      // Very strict: red must be MUCH higher than green and blue
      if (r > 120 && r > g + 40 && r > b + 40 && g < 100 && b < 100) {
        brightRedPixels++;
      }

      // Dark red detection (like deoxygenated blood)
      if (r > 80 && r < 150 && r > g + 30 && r > b + 30 && g < 80 && b < 80) {
        darkRedPixels++;
      }

      // Skin tone detection (to exclude hands, faces, etc.)
      // Skin has balanced RGB with slight red tint
      if (r > 140 && g > 100 && b > 80 && r - g < 50 && r - b < 80) {
        skinTonePixels++;
      }

      // Count blue pixels (to exclude Earth)
      if (b > r + 30 && b > g + 20 && b > 80) {
        bluePixels++;
      }
    }

    const brightRedPercent = (brightRedPixels / totalPixels) * 100;
    const darkRedPercent = (darkRedPixels / totalPixels) * 100;
    const bluePercent = (bluePixels / totalPixels) * 100;
    const skinPercent = (skinTonePixels / totalPixels) * 100;
    const totalRedPercent = brightRedPercent + darkRedPercent;

    console.log(`Heart detection - Bright Red: ${brightRedPercent.toFixed(1)}%, Dark Red: ${darkRedPercent.toFixed(1)}%, Total Red: ${totalRedPercent.toFixed(1)}%, Skin: ${skinPercent.toFixed(1)}%, Blue: ${bluePercent.toFixed(1)}%`);

    // Very low thresholds for easier recognition:
    // - Total red >5% (lowered from 10%)
    // - Bright red >2% (lowered from 4%)
    // - Skin <70% (raised from 50%)
    // - Blue <10% (raised from 8%)
    const isHeart = totalRedPercent > 5 &&
      brightRedPercent > 2 &&
      skinPercent < 70 &&
      bluePercent < 10;

    return {
      match: isHeart,
      confidence: Math.min(totalRedPercent * 2, 100),
      detected: `Bright Red: ${brightRedPercent.toFixed(1)}%, Dark Red: ${darkRedPercent.toFixed(1)}%, Skin: ${skinPercent.toFixed(1)}%`
    };
  };

  const recognizeWithMobileNet = async (imageElement: HTMLImageElement): Promise<{ match: boolean; confidence: number; detected: string }> => {
    if (!model) {
      return { match: false, confidence: 0, detected: 'Model not loaded' };
    }

    try {
      // Classify the image
      const predictions = await model.classify(imageElement, 5); // Get top 5 predictions

      console.log('MobileNet predictions:', predictions);

      // Look for brain-related classifications
      const brainKeywords = ['brain', 'head', 'skull', 'cerebrum', 'neuron', 'neural'];
      let highestBrainScore = 0;
      let brainPrediction = '';

      for (const prediction of predictions) {
        const className = prediction.className.toLowerCase();
        const probability = prediction.probability;

        // Check if any brain keyword is in the classification
        for (const keyword of brainKeywords) {
          if (className.includes(keyword)) {
            if (probability > highestBrainScore) {
              highestBrainScore = probability;
              brainPrediction = className;
            }
            break;
          }
        }
      }

      // If we found a brain-related classification with high confidence
      if (highestBrainScore > 0.1) { // 10% threshold
        return {
          match: true,
          confidence: highestBrainScore * 100,
          detected: `AI detected: ${brainPrediction} (${(highestBrainScore * 100).toFixed(1)}%)`
        };
      }

      // Return the top prediction if no brain-related one was found
      if (predictions.length > 0) {
        return {
          match: false,
          confidence: predictions[0].probability * 100,
          detected: `Top prediction: ${predictions[0].className} (${(predictions[0].probability * 100).toFixed(1)}%)`
        };
      }

      return { match: false, confidence: 0, detected: 'No predictions' };
    } catch (error) {
      console.error('MobileNet recognition error:', error);
      return { match: false, confidence: 0, detected: 'AI recognition failed' };
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready. Please wait...");
      return;
    }

    setIsScanning(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Calculate the scanning frame dimensions (the blue box)
    const frameSize = 288; // 72 * 4 = 288px (w-72 in Tailwind)
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Calculate center crop coordinates
    const cropX = (videoWidth - frameSize) / 2;
    const cropY = (videoHeight - frameSize) / 2;

    // Set canvas to the size of the scanning frame
    canvas.width = frameSize;
    canvas.height = frameSize;

    const context = canvas.getContext("2d");
    if (context) {
      // Draw only the cropped area (inside the blue box)
      context.drawImage(
        video,
        cropX, cropY, frameSize, frameSize,  // Source crop area
        0, 0, frameSize, frameSize            // Destination on canvas
      );

      const imageData = context.getImageData(0, 0, frameSize, frameSize);
      const canvasDataUrl = canvas.toDataURL("image/jpeg");

      // Check if image has significant content (not blank)
      if (!hasSignificantContent(imageData)) {
        setIsScanning(false);
        toast.error("✗ Blank or empty image detected. Please scan an actual image.");
        return;
      }

      try {
        let result: { match: boolean; confidence: number; detected: string };

        if (topicTitle === "Planet Earth") {
          result = analyzeColorForEarth(imageData);
        } else if (topicTitle === "Human Brain" && model) {
          // Create an image element from the canvas data for MobileNet
          const img = new Image();
          img.src = canvasDataUrl;

          // Wait for image to load
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          // Try MobileNet recognition first
          result = await recognizeWithMobileNet(img);

          // If MobileNet fails, fall back to shape analysis
          if (!result.match) {
            const fallbackResult = analyzeShapeForBrain(imageData);
            // Combine results for better accuracy
            result = {
              match: fallbackResult.match,
              confidence: Math.max(result.confidence, fallbackResult.confidence),
              detected: `${result.detected} | Fallback: ${fallbackResult.detected}`
            };
          }
        } else if (topicTitle === "Human Brain") {
          // Fallback to shape analysis if model isn't loaded
          result = analyzeShapeForBrain(imageData);
        } else if (topicTitle === "Human Heart") {
          result = analyzeShapeForHeart(imageData);
        } else {
          result = { match: false, confidence: 0, detected: 'Unknown topic' };
        }

        setIsScanning(false);

        if (result.match) {
          onImageRecognized(canvasDataUrl);
          toast.success(`✓ Recognized: ${topicTitle}! Confidence: ${result.confidence.toFixed(1)}%`);
        } else {
          toast.error(`✗ Not recognized as ${topicTitle}. ${result.detected}`);
        }
      } catch (error) {
        console.error('Recognition error:', error);
        setIsScanning(false);
        toast.error('Failed to recognize image. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-4 border-primary rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-2xl" />

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 px-6 py-3 rounded-full flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-white text-sm">{model && topicTitle === "Human Brain" ? "AI Recognizing..." : "Recognizing..."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute top-8 left-0 right-0 flex justify-center">
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full max-w-md">
            {isModelLoading && topicTitle === "Human Brain" ? (
              <p className="text-white text-sm text-center flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading AI brain recognition model...
              </p>
            ) : (
              <p className="text-white text-sm text-center">
                {topicTitle === "Planet Earth" && (
                  <span>Scan an image showing <span className="font-semibold text-secondary">blue oceans</span> from space</span>
                )}
                {topicTitle === "Human Brain" && (
                  <span>Scan a <span className="font-semibold text-secondary">brain anatomy</span> image. AI-enhanced recognition enabled!</span>
                )}
                {topicTitle === "Human Heart" && (
                  <span>Scan a <span className="font-semibold text-secondary">red/pink heart</span> anatomy image showing chambers</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </Button>

        <Button
          onClick={captureAndRecognize}
          disabled={isScanning || (isModelLoading && topicTitle === "Human Brain")}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Scan Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
