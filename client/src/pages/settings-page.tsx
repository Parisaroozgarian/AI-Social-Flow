import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserSettings } from "@shared/schema";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      setIsSaving(true);
      const response = await apiRequest("PATCH", "/api/settings", newSettings);
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Update theme if it was changed
      if (data.theme) {
        setTheme(data.theme as 'light' | 'dark' | 'system');
      }
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  if (!user) {
    return null; // Protected route will handle redirect
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Appearance</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <Select
              value={settings?.theme || theme}
              onValueChange={(value) => handleSettingChange("theme", value)}
              disabled={updateSettingsMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Notifications</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your scheduled posts and content analysis
              </p>
            </div>
            <Switch
              checked={settings?.emailNotifications || false}
              onCheckedChange={(checked) =>
                handleSettingChange("emailNotifications", checked)
              }
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your content performance
              </p>
            </div>
            <Switch
              checked={settings?.weeklyDigest || false}
              onCheckedChange={(checked) =>
                handleSettingChange("weeklyDigest", checked)
              }
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Content</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Language</Label>
              <p className="text-sm text-muted-foreground">
                Set your preferred language for AI-generated content
              </p>
            </div>
            <Select
              value={settings?.contentLanguage || "en"}
              onValueChange={(value) =>
                handleSettingChange("contentLanguage", value)
              }
              disabled={updateSettingsMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Schedule Posts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically schedule posts at optimal times
              </p>
            </div>
            <Switch
              checked={settings?.autoSchedule || false}
              onCheckedChange={(checked) =>
                handleSettingChange("autoSchedule", checked)
              }
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}