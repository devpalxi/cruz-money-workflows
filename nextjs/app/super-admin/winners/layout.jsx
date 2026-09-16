import { WinnersProvider } from '@/lib/WinnersContext';

export default function SuperAdminWinnersLayout({ children }) {
  return <WinnersProvider>{children}</WinnersProvider>;
}
