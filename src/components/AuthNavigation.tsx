import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthNavigation() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome back!
        </span>
        <Button variant="outline" onClick={signOut} size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild size="sm">
        <Link to="/login">Sign In</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/register">Register</Link>
      </Button>
    </div>
  );
}