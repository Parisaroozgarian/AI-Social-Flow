import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Hash, Activity, MessageSquare, Trash2 } from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { ContentHistory } from '@shared/schema';

type GeneratedContent = {
  content: string;
  hashtags: string[];
  engagement_prediction: number;
  tone: string;
  quality_metrics: {
    clarity: number;
    relevance: number;
    originality: number;
    engagement_potential: number;
  }
}

export function ContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();
  const { generateContent, isConnected } = useWebSocket();
  const { user } = useAuth();

  // Fetch content history
  const { data: contentHistory } = useQuery<ContentHistory[]>({
    queryKey: ['/api/content-history'],
    enabled: !!user,
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/content-history/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-history'] });
      toast({
        title: 'Content Deleted',
        description: 'The content has been removed from history.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = async () => {
    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the content generation service. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateContent(prompt, platform);
      setGeneratedContent(result);

      // Save to history
      if (user) {
        await apiRequest('POST', '/api/content-history', {
          content: result.content,
          platform,
          hashtags: result.hashtags,
          engagement_prediction: result.engagement_prediction,
          tone: result.tone,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/content-history'] });
      }

      toast({
        title: 'Content Generated',
        description: 'Your content has been generated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your content prompt..."
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating || !isConnected}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>

          {generatedContent && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generated Content:
                </h3>
                <p className="whitespace-pre-wrap">{generatedContent.content}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Engagement Prediction
                  </h4>
                  <p className="text-2xl font-semibold">{generatedContent.engagement_prediction}%</p>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Content Tone</h4>
                  <p className="capitalize">{generatedContent.tone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Content History Section */}
      {user && contentHistory && contentHistory.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">History</h2>
          <div className="space-y-4">
            {contentHistory.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Generated on {format(new Date(item.generatedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-sm font-medium">Platform: {item.platform}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteContentMutation.mutate(item.id)}
                    disabled={deleteContentMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="whitespace-pre-wrap">{item.content}</p>
                {item.hashtags && (
                  <div className="flex flex-wrap gap-2">
                    {item.hashtags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}