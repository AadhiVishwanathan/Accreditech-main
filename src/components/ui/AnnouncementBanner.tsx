import { Bell, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

const announcements = [
  "🎉 New AI-powered document verification system launched - 85% faster processing!",
  "📅 Application deadline for Academic Year 2024-25 extended to October 31st, 2024",
  "🚀 Real-time application tracking now available for all institutes",
  "⚡ System maintenance scheduled for this Sunday 2:00 AM - 4:00 AM IST",
  "📢 New guidelines for Infrastructure documentation released - Check Downloads section",
];

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-primary text-primary-foreground">
      <div className="relative overflow-hidden">
        <div className="flex items-center py-3 px-4">
          <Bell className="h-4 w-4 mr-3 flex-shrink-0" />
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              {announcements.map((announcement, index) => (
                <span key={index} className="inline-block mx-8 text-sm font-medium">
                  {announcement}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="ml-3 h-6 w-6 p-0 hover:bg-primary-foreground/20 text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}