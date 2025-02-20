import { SchedulePosts } from "@/components/SchedulePosts";

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Schedule Posts</h1>
      <SchedulePosts />
    </div>
  );
}
