import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, ArrowRight, Calendar, Image as ImageIcon, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user/1']
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">User Profile</h2>
            
            {isLoadingUser ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {user?.name || "Not set"}</p>
                <p><span className="font-medium">Current CI Level:</span> CI-{user?.ciLevel || 0}</p>
                <p><span className="font-medium">Goal:</span> CI-{user?.targetCi || 8}</p>
                
                <Link href="#profile">
                  <Button variant="outline" size="sm" className="mt-2">
                    View Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link href="#tracking">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Log today's tracking
                </Button>
              </Link>
              
              <Link href="#photos">
                <Button className="w-full justify-start" variant="outline">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload progress photo
                </Button>
              </Link>
              
              <Link href="#analysis">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View progress analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Welcome to RestoreTrack</h2>
          <p className="text-neutral-600 mb-4">
            RestoreTrack helps you monitor and track your foreskin restoration progress.
            Use the navigation to access different sections of the app.
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-neutral-600 mb-4">
            <li><strong>Profile:</strong> Update your personal information and restoration details</li>
            <li><strong>Photos:</strong> Securely upload and manage progress photos</li>
            <li><strong>Daily Tracking:</strong> Log your daily restoration activities</li>
            <li><strong>Analysis:</strong> View charts and insights about your progress</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
