import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { scheduledPostSchema, ScheduledPost } from '@shared/schema';
import { Card, CardContent, CardHeader } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { parse, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type ScheduleFormData = {
  content: string;
  platform: string;
  scheduledTime: string;
};

export function SchedulePosts() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduledPostSchema),
    defaultValues: {
      content: '',
      platform: 'twitter',
      scheduledTime: new Date().toISOString(),
    },
  });

  const { data: scheduledPosts = [], isLoading } = useQuery<ScheduledPost[]>({
    queryKey: ['/api/scheduled-posts'],
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to schedule post');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      form.reset();
      setSelectedDate(new Date());
      setSelectedTime('12:00');
      toast({
        title: 'Post Scheduled',
        description: 'Your content has been scheduled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule the post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    if (!selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a new date object with the selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // Format the date as a valid ISO string
      await scheduleMutation.mutateAsync({
        ...data,
        scheduledTime: scheduledDate.toISOString(),
      });
    } catch (error) {
      console.error('Schedule error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule post',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Schedule Posts</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your content..."
                      {...field}
                      disabled={scheduleMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={scheduleMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={scheduleMutation.isPending}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1"
                  disabled={scheduleMutation.isPending}
                />
              </div>
            </div>

            <Button type="submit" disabled={scheduleMutation.isPending}>
              {scheduleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Post'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Scheduled Posts</h3>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : scheduledPosts.length > 0 ? (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="text-sm mb-2">{post.content}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Platform</p>
                        <p className="capitalize">{post.platform}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p>{format(new Date(post.scheduledTime), 'PPp')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="capitalize">{post.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No scheduled posts yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}