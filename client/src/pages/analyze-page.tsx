import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contentAnalysisSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { analyzeContent } from "@/lib/content-analysis";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Activity, Hash, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ContentAnalysis } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export default function AnalyzePage() {
  const { toast } = useToast();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(contentAnalysisSchema),
    defaultValues: {
      content: "",
    },
  });

  // Query for fetching analysis history
  const { data: analyses } = useQuery<ContentAnalysis[]>({
    queryKey: ["/api/analyses"],
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeContent,
    onSuccess: () => {
      // Immediately invalidate both the analyses query and trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      form.reset();
      toast({
        title: "Analysis complete",
        description: "Your content has been analyzed successfully.",
      });
      // Open history section when new analysis is added
      setIsHistoryOpen(true);
    },
  });

  // Delete analysis mutation
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      const response = await apiRequest("DELETE", `/api/analyses/${analysisId}`);
      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }
    },
    onSuccess: () => {
      // Immediately invalidate the analyses query
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed from history.",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Analyze Content</h1>

      {/* Analysis Form */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => analyzeMutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your content here..."
                        className="min-h-[200px] resize-none border-2 focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={analyzeMutation.isPending}
                className="w-full"
              >
                {analyzeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
            </form>
          </Form>

          {/* Collapsible Analysis History Section */}
          {analyses && analyses.length > 0 && (
            <Collapsible
              open={isHistoryOpen}
              onOpenChange={setIsHistoryOpen}
              className="mt-8"
            >
              <div className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center p-4 hover:bg-muted"
                  >
                    <span className="font-medium">History</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isHistoryOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="divide-y">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Analyzed on {format(new Date(analysis.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnalysisMutation.mutate(analysis.id)}
                          disabled={deleteAnalysisMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm whitespace-pre-wrap">{analysis.content}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Activity className="w-4 h-4 mr-2" />
                            Engagement Score
                          </h4>
                          <p className="text-xl font-semibold">{analysis.engagementScore}%</p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Sentiment</h4>
                          <p className="capitalize">{analysis.sentiment.label}</p>
                          <p className="text-sm text-muted-foreground">Score: {Math.round(analysis.sentiment.score)}%</p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Hash className="w-4 h-4 mr-2" />
                            Hashtags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.hashtags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
}