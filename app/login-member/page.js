import { loginMember } from './actions';
import LoginForm from './LoginForm';

export default function MemberLoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2b4d59 0%, #1a2f38 100%)',
      padding: '20px'
    }}>
      <LoginForm loginAction={loginMember} />
    </div>
  );
}
