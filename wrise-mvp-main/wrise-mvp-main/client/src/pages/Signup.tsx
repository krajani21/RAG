import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Mail, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("fan");
  const navigate = useNavigate();
  const { signup } = useAuth();
  const location = useLocation();
  
  const handleSignUp = async () => {
    try {
      const isCreator = role === "creator";
      await signup(email, password, name, isCreator);
      alert("Signed up! Check your email to verify.");
      
      // Check if there's a redirect parameter
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get("redirect");
      
      if (redirectPath) {
        // If there's a redirect parameter, use it
        navigate(redirectPath);
      } else {
        // Otherwise, use default behavior based on role
        if (isCreator) {
          navigate("/creator-dashboard");
        } else {
          navigate("/fan");
        }
      }
    } catch (err: any) {
      alert(err.message || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-clonark-surface to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-clonark-primary to-clonark-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Clonark
          </Link>
          <p className="text-clonark-text-secondary mt-2">
            Built for creators who are tired of repeating themselves
          </p>
        </div>
        
        <Card className="card-premium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Create your account
            </CardTitle>
            <CardDescription> Start building your digital brain today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-clonark-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-clonark-text-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-700"
                >
                  <option value="creator">Creator</option>
                  <option value="fan">Fan</option>
                </select>
              </div>
              <Button onClick={handleSignUp} className="w-full btn-primary h-12 text-base">
                Sign Up
              </Button>
            </div>

        <p className="text-gray-500 text-center mt-4">
          Already have an account?{" "}
          <Link to ="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};


