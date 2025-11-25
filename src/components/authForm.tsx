import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

interface AuthFormProps {
  isLogin: boolean;
}

const AuthForm = ({ isLogin }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useFirebaseUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      } else {
        await signup(email, password);
        toast.success("Account created! Please sign in.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Signed in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent className="pt-6 bg-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-normal text-gray-900 mb-2">
          {isLogin ? "Sign in" : "Create account"}
        </h2>
        <p className="text-gray-600">
          {isLogin ? "Use your Google account" : "Get started with your Google account"}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full mb-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg h-12 font-medium"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <FcGoogle className="mr-3 h-5 w-5" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLogin ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            <>
              {isLogin ? "Sign in" : "Create account"}
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isLogin ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </CardContent>
  );
};

export default AuthForm;
