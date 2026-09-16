export const metadata = {
  title: 'Verify your payout',
  description: 'Confirm your identity and bank details to receive your payout.',
};

// Patron-facing shell. Deliberately carries none of the staff chrome - no
// AppHeader, no role badge, no operator stepper - because the person holding
// this phone is a customer, not an operator. On a desktop screen the column is
// capped so the page still reads as the phone view it is.
export default function VerifyLayout({ children }) {
  return (
    <div className="flex-1 w-full bg-surface-page flex justify-center">
      <div className="w-full max-w-[480px] bg-white flex flex-col shadow-card">
        {children}
      </div>
    </div>
  );
}
