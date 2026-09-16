import { WinnersProvider } from '@/lib/WinnersContext';

export default function AdminWinnersLayout({ children }) {
  return <WinnersProvider>{children}</WinnersProvider>;
}
