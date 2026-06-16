import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, Building2, Clock, ChevronRight } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import EVCLoginModal from "@/components/auth/EVCLoginModal";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import aicteLogo from "@/assets/aicte-logo.png";
export default function HomePage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [evcLoginModalOpen, setEvcLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'institute'>('institute');
  const handleLogin = (type: 'admin' | 'institute') => {
    setLoginType(type);
    setLoginModalOpen(true);
  };
  const stats = [{
    label: "Total Applications",
    value: "1,847",
    icon: Building2,
    color: "text-primary"
  }, {
    label: "Approved Today",
    value: "67",
    icon: Users,
    color: "text-success"
  }, {
    label: "Processing",
    value: "234",
    icon: Clock,
    color: "text-warning"
  }, {
    label: "Avg. Processing Time",
    value: "2.3 Days",
    icon: Bell,
    color: "text-info"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={aicteLogo} alt="AICTE Logo" className="h-10 lg:h-12 w-auto" />
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-primary">AccrediTech</h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">Revolutionizing Institute Accreditation Through AI</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden lg:flex text-xs">Revolutionizing Institute Accreditation</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 lg:mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-3 lg:mb-4">
            Welcome to <span className="text-primary">AccrediTech</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto px-2">
            Streamlining AICTE approval processes with cutting-edge AI technology. 
            Fast, transparent, and efficient accreditation for educational institutions.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8 lg:mb-12">
          {stats.map((stat, index) => <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300">
              <CardContent className="pt-4 lg:pt-6 pb-4 lg:pb-6 px-3 lg:px-6">
                <stat.icon className={`h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-xl lg:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Login Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 lg:mb-8">
            <img src={aicteLogo} alt="AICTE Logo" className="h-16 lg:h-20 w-auto mx-auto mb-3 lg:mb-4" />
            <h3 className="text-xl lg:text-2xl font-semibold mb-2">Choose Your Portal</h3>
            <p className="text-muted-foreground text-sm lg:text-base">Select the appropriate login option to continue</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Institute Login Card */}
            <Card className="hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <Building2 className="h-8 w-8 lg:h-10 lg:w-10 mx-auto text-primary mb-2 lg:mb-3" />
                <CardTitle className="text-base lg:text-lg">Institute Portal</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  For educational institutions to submit applications and track status
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-muted-foreground">Submit applications</p>
                  <p className="text-xs text-muted-foreground">Track progress</p>
                  <p className="text-xs text-muted-foreground">Manage documents</p>
                </div>
                <Button 
                  onClick={() => handleLogin('institute')} 
                  className="w-full mb-2"
                  size="sm"
                >
                  Institute Login
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setRegisterModalOpen(true)} 
                  className="w-full"
                  size="sm"
                >
                  Register Institute
                </Button>
              </CardContent>
            </Card>

            {/* Admin Login Card */}
            <Card className="hover:shadow-elegant transition-all duration-300 border-2 hover:border-secondary/20">
              <CardHeader className="text-center pb-4">
                <Users className="h-8 w-8 lg:h-10 lg:w-10 mx-auto text-secondary mb-2 lg:mb-3" />
                <CardTitle className="text-base lg:text-lg">Admin Portal</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  For AICTE officials to review applications and manage evaluators
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-muted-foreground">Review applications</p>
                  <p className="text-xs text-muted-foreground">Assign evaluators</p>
                  <p className="text-xs text-muted-foreground">Generate insights</p>
                </div>
                <Button 
                  onClick={() => handleLogin('admin')} 
                  variant="secondary"
                  className="w-full"
                  size="sm"
                >
                  Admin Login
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* EVC Login Card */}
            <Card className="hover:shadow-elegant transition-all duration-300 border-2 hover:border-warning/20">
              <CardHeader className="text-center pb-4">
                <Clock className="h-8 w-8 lg:h-10 lg:w-10 mx-auto text-warning mb-2 lg:mb-3" />
                <CardTitle className="text-base lg:text-lg">EVC Portal</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  For Expert Visit Committee chairmen to evaluate institutions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-muted-foreground">View assignments</p>
                  <p className="text-xs text-muted-foreground">Evaluate institutions</p>
                  <p className="text-xs text-muted-foreground">Submit reports</p>
                </div>
                <Button 
                  onClick={() => setEvcLoginModalOpen(true)} 
                  variant="outline"
                  className="w-full border-warning text-warning hover:bg-warning/10"
                  size="sm"
                >
                  EVC Login
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg lg:text-xl">Real-time Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm lg:text-base">
                Track your application status in real-time with automated notifications and updates.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg lg:text-xl">AI-Powered Processing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm lg:text-base">
                Advanced AI algorithms streamline document verification and reduce processing time by 85%.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg lg:text-xl">Expert Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm lg:text-base">
                Comprehensive evaluation by qualified experts with transparent scoring and feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-12 lg:mt-16">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <img src={aicteLogo} alt="AICTE Logo" className="h-6 lg:h-8 w-auto" />
              <span className="text-xs lg:text-sm text-muted-foreground text-center lg:text-left">
                © 2024 All India Council for Technical Education
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs lg:text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Help</a>
              <a href="#" className="hover:text-primary transition-colors">Guidelines</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} userType={loginType} />
      <RegisterModal open={registerModalOpen} onOpenChange={setRegisterModalOpen} />
      <EVCLoginModal isOpen={evcLoginModalOpen} onClose={() => setEvcLoginModalOpen(false)} />
    </div>;
}