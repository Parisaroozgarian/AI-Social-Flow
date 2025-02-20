import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGithub, SiInstagram, SiLinkedin, SiFacebook } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type SocialAccount, socialAccountSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, email: true })),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const { data: socialAccounts, isLoading: loadingSocialAccounts } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string | undefined }) => {
      if (!user?.id) throw new Error("User ID not found");
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const connectSocialAccountMutation = useMutation({
    mutationFn: async (platform: string) => {
      // Mock social media connection flow
      // In a real app, this would redirect to OAuth
      const mockData = {
        userId: user?.id,
        platform,
        accountId: `mock-${platform}-${Date.now()}`,
        accessToken: `mock-token-${Date.now()}`,
        username: `${user?.username}@${platform}`,
      };

      const res = await apiRequest("POST", "/api/social-accounts", mockData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: "Account connected",
        description: "Social account has been connected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeSocialAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/social-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: "Account removed",
        description: "Social account has been disconnected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const socialPlatforms = [
    { id: "github", name: "GitHub", icon: SiGithub },
    { id: "instagram", name: "Instagram", icon: SiInstagram },
    { id: "linkedin", name: "LinkedIn", icon: SiLinkedin },
    { id: "facebook", name: "Facebook", icon: SiFacebook },
  ];

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePicture || ""} alt={user.username} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Connected Social Accounts */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Connected Accounts</h2>
          </CardHeader>
          <CardContent>
            {loadingSocialAccounts ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {socialPlatforms.map((platform) => {
                  const connected = socialAccounts?.find(
                    (account) => account.platform === platform.id
                  );
                  const Icon = platform.icon;

                  return (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span>{platform.name}</span>
                      </div>
                      {connected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {connected.username}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialAccountMutation.mutate(connected.id)}
                            disabled={removeSocialAccountMutation.isPending}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => connectSocialAccountMutation.mutate(platform.id)}
                          disabled={connectSocialAccountMutation.isPending}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}