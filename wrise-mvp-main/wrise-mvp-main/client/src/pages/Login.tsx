import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Mail, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const handleLogin = async () => {
  try {
    const loggedInUser = await login(email, password);

    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect");

    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    } else {
      if (loggedInUser.isCreator) {
        navigate("/creator-dashboard");
      } else {
        navigate("/fan");
      }
    }
  } catch (err: any) {
    alert(err.message || "Login failed.");
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Clonark account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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

            <Button onClick={handleLogin} className="w-full btn-gradient">
              Login
            </Button>
          <p className=" text-gray-500 text-center mt-4">
            Don't have an account?{" "}
            <Link to={`/signup${location.search}`} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
