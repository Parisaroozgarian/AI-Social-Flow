import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Welcome to AI Social Flow</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use the navigation menu to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Generate AI powered social media content</li>
              <li>Schedule and manage your posts</li>
              <li>Analyze content performance</li>
              <li>View your analysis history</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
