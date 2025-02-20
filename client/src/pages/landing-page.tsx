import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { SiOpenai } from "react-icons/si";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Brain,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            AI Social Flow
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create, analyze, and schedule content across platforms with the
            power of artificial intelligence
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <Brain className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                AI Content Generation
              </h3>
              <p className="text-muted-foreground">
                Generate engaging content tailored to your audience using
                advanced AI
              </p>
            </Card>
            <Card className="p-6">
              <Calendar className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Schedule posts at optimal times for maximum engagement
              </p>
            </Card>
            <Card className="p-6">
              <BarChart3 className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Analytics & Insights
              </h3>
              <p className="text-muted-foreground">
                Track performance and get AI-powered recommendations
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of creators using AI to enhance their social media
            presence
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
