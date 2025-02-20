import { ContentGenerator } from "@/components/ContentGenerator";

export default function GeneratePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Generate Content</h1>
      <ContentGenerator />
    </div>
  );
}
