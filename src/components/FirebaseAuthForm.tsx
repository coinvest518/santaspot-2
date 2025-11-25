import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FirebaseAuthFormProps {
  isLogin: boolean;
}

const FirebaseAuthForm = ({ isLogin }: FirebaseAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useFirebaseUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      } else {
        await signup(email, password);
        toast.success('Account created! Please sign in.');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  return (
    <CardContent className="pt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
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
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLogin ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </form>
      <div className="my-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
        Sign In with Google
      </Button>
    </CardContent>
  );
};

export default FirebaseAuthForm;
