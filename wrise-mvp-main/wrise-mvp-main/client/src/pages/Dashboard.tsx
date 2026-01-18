
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BarChart, Calendar, ChevronUp, MessageSquare, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";

// Mock data
const revenueData = [
  { name: "Jan", amount: 400 },
  { name: "Feb", amount: 600 },
  { name: "Mar", amount: 560 },
  { name: "Apr", amount: 800 },
  { name: "May", amount: 900 },
  { name: "Jun", amount: 1100 },
  { name: "Jul", amount: 1204.97 },
];

const subscribersData = [
  { name: "Jan", count: 24 },
  { name: "Feb", count: 42 },
  { name: "Mar", count: 67 },
  { name: "Apr", count: 78 },
  { name: "May", count: 98 },
  { name: "Jun", count: 120 },
  { name: "Jul", count: 143 },
];

const questionsData = [
  { name: "Mon", count: 12 },
  { name: "Tue", count: 24 },
  { name: "Wed", count: 17 },
  { name: "Thu", count: 32 },
  { name: "Fri", count: 28 },
  { name: "Sat", count: 15 },
  { name: "Sun", count: 20 },
];

const topTopics = [
  { name: "Content Creation", count: 42 },
  { name: "Equipment Setup", count: 37 },
  { name: "Social Media Growth", count: 28 },
  { name: "Monetization", count: 25 },
  { name: "Editing Tips", count: 21 },
];

const triggerComments = [
  { 
    text: "How do you edit your videos?",
    platform: "YouTube",
    interactions: 23,
    active: true
  },
  { 
    text: "What camera do you use?",
    platform: "Instagram",
    interactions: 19,
    active: true
  },
  { 
    text: "Can you recommend software for beginners?",
    platform: "YouTube",
    interactions: 15,
    active: false
  },
  { 
    text: "How do I get started?",
    platform: "Instagram",
    interactions: 12,
    active: true
  },
  { 
    text: "What's your favorite location to shoot?",
    platform: "YouTube",
    interactions: 8,
    active: false
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to access your dashboard</h1>
          <Link to="/onboarding">
            <Button>Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}! Here's what's happening with your fan hub.</p>
          </div>
          
          <Link to={`/hub/${user.id}`} target="_blank">
            <Button className="btn-gradient">
              View Fan Hub <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience Analysis</TabsTrigger>
            <TabsTrigger value="triggers">Comment Triggers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-sm font-medium text-gray-500">Subscribers</CardTitle>
                    <CardDescription>Monthly income</CardDescription>
                  </div>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.subscriberCount}</div>
                  <div className="text-sm text-green-600 flex items-center mt-1">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>12% from last month</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ${(parseFloat(user.subscriberCount?.toString() || "0") * 7.99).toFixed(2)} monthly recurring revenue
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                    <CardDescription>Lifetime earnings</CardDescription>
                  </div>
                  <BarChart className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.revenue?.toFixed(2)}</div>
                  <div className="text-sm text-green-600 flex items-center mt-1">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>23% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-sm font-medium text-gray-500">Questions Asked</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </div>
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">148</div>
                  <div className="text-sm text-green-600 flex items-center mt-1">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>18% from previous week</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: unknown) => [`$${value}`, 'Revenue']}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#A88BFF" 
                          strokeWidth={3}
                          activeDot={{ r: 6, fill: "#A88BFF", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={subscribersData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [value, 'Subscribers']}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#A88BFF" 
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest interactions from your fan hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "subscription",
                      user: "Jamie Smith",
                      time: "2 hours ago",
                      detail: "Subscribed to your fan hub ($7.99/month)"
                    },
                    {
                      type: "question",
                      user: "Alex Chen",
                      time: "5 hours ago",
                      detail: "Asked: \"What editing software do you recommend for beginners?\""
                    },
                    {
                      type: "question",
                      user: "Sarah Johnson",
                      time: "Yesterday",
                      detail: "Asked: \"How do you come up with content ideas consistently?\""
                    },
                    {
                      type: "subscription",
                      user: "Michael Brown",
                      time: "2 days ago",
                      detail: "Subscribed to your fan hub ($7.99/month)"
                    },
                    {
                      type: "question",
                      user: "Taylor Wilson",
                      time: "3 days ago",
                      detail: "Asked: \"What's your favorite camera for travel vlogging?\""
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === "subscription" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      }`}>
                        {activity.type === "subscription" ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="font-medium">{activity.user}</p>
                          <span className="text-xs text-gray-500 ml-2">{activity.time}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audience">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Question Activity</CardTitle>
                    <CardDescription>Questions asked by fans over the last week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={questionsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Questions']}
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#88F0D3" 
                            radius={[4, 4, 0, 0]}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Most Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        "What camera equipment do you use for your videos?",
                        "How do you edit your Instagram photos?",
                        "How much do you earn from YouTube?",
                        "What's your content creation workflow like?",
                        "How do you find sponsors for your content?"
                      ].map((question, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{question}</p>
                            <span className="px-2 py-1 bg-wrise-accent/20 text-wrise-contrast rounded-full text-xs font-medium">
                              {Math.floor(Math.random() * 20) + 5}x
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {Math.random() > 0.5 ? "From YouTube comments" : "From Instagram comments"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Hot Topics This Week</CardTitle>
                    <CardDescription>What your fans are most interested in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-16 rounded-full mr-4"
                              style={{
                                backgroundColor: `rgba(168, 139, 255, ${1 - index * 0.15})`,
                              }}
                            ></div>
                            <p>{topic.name}</p>
                          </div>
                          <span className="text-gray-500">{topic.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Fan Engagement Calendar</CardTitle>
                    <CardDescription>Upcoming content opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          date: "Jul 28",
                          title: "Content Surge Expected",
                          description: "Based on past trends, expect higher engagement"
                        },
                        {
                          date: "Aug 3",
                          title: "Topic Trend: Equipment",
                          description: "Questions about equipment are increasing"
                        },
                        {
                          date: "Aug 12",
                          title: "Subscription Peak",
                          description: "Historically high subscription day"
                        }
                      ].map((event, index) => (
                        <div key={index} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className="w-10 h-10 rounded-full bg-wrise-primary/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-wrise-primary" />
                            </div>
                            <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{event.date}</p>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="triggers">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Comment Triggers</CardTitle>
                <CardDescription>
                  When fans post these comments, we'll automatically direct them to your Fan Hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {triggerComments.map((comment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              comment.platform === "YouTube" 
                                ? "bg-red-100 text-red-600" 
                                : "bg-purple-100 text-purple-600"
                            }`}>
                              {comment.platform}
                            </span>
                            {comment.active && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="font-medium mb-1">{comment.text}</p>
                          <p className="text-sm text-gray-500">
                            {comment.interactions} fan interactions triggered
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button 
                            variant={comment.active ? "destructive" : "default"} 
                            size="sm"
                          >
                            {comment.active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                      
                      {comment.active && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium mb-1">Auto-response:</p>
                          <p className="text-sm text-gray-600">
                            "Thanks for your comment! I've created a detailed response to this question in my Fan Hub. Check it out here: wrise.io/{user?.name?.toLowerCase().replace(/\s+/g, "")}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Add New Trigger</CardTitle>
                <CardDescription>Create a new comment trigger to automatically respond to fans</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="triggerText" className="text-sm font-medium">
                      Trigger phrase or question
                    </label>
                    <input
                      id="triggerText"
                      className="w-full border rounded-md p-2"
                      placeholder="e.g., 'How do I get started?' or 'What equipment do you use?'"
                    />
                    <p className="text-xs text-gray-500">
                      When fans comment this phrase, they'll receive an auto-response
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform</label>
                      <select className="w-full border rounded-md p-2">
                        <option>YouTube</option>
                        <option>Instagram</option>
                        <option>Both platforms</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full border rounded-md p-2">
                        <option>Active</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="responseText" className="text-sm font-medium">
                      Auto-response message
                    </label>
                    <textarea
                      id="responseText"
                      className="w-full border rounded-md p-2 h-24"
                      placeholder="Write your auto-response message here..."
                      defaultValue={`Thanks for your comment! I've created a detailed response to this question in my Fan Hub. Check it out here: wrise.io/${user?.name?.toLowerCase().replace(/\s+/g, "")}`}
                    ></textarea>
                    <p className="text-xs text-gray-500">
                      This message will be automatically posted in reply to the trigger
                    </p>
                  </div>
                  
                  <Button className="w-full btn-gradient">
                    Create Trigger
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
