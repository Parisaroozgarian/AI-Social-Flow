import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We'll get back to you soon!",
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="youremail@gmail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea
                  placeholder="How can we help you?"
                  className="min-h-[150px]"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <span>support@aifocialflow.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <span>+1 (000) 000-000</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>Toronto , CA</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Office Hours</h2>
              <p className="text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM (PST)
                <br />
                Saturday: 10:00 AM - 4:00 PM (PST)
                <br />
                Sunday: Closed
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
