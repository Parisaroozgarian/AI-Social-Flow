import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ContentAnalysis } from "@shared/schema";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
  // Remove refetchInterval to rely on cache invalidation for updates
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery<ContentAnalysis[]>({
    queryKey: ["/api/analyses"],
  });

  // Prepare data for hashtag frequency chart
  const hashtagFrequency = analyses.reduce((acc, analysis) => {
    analysis.hashtags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const hashtagData = Object.entries(hashtagFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 hashtags

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculate sentiment distribution
  const sentimentData = analyses.reduce((acc, analysis) => {
    const sentiment = analysis.sentiment.label;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentimentChartData = Object.entries(sentimentData)
    .map(([label, count]) => ({ label, count }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analysis History</h1>

      {isLoadingAnalyses ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : analyses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engagement Score Trend */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Engagement Score Trend</h2>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="createdAt"
                      tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                      formatter={(value: number) => [`${value}%`, 'Engagement']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagementScore" 
                      stroke="hsl(var(--primary))"
                      name="Engagement"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Score Trend */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Sentiment Score Trend</h2>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="createdAt"
                      tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                      formatter={(value: number) => [`${value}%`, 'Sentiment Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sentiment.score" 
                      stroke="#8884d8"
                      name="Sentiment"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Hashtags */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Top Hashtags</h2>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hashtagData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Sentiment Distribution</h2>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-muted-foreground p-8">
          No analyses yet. Start by analyzing some content!
        </p>
      )}
    </div>
  );
}