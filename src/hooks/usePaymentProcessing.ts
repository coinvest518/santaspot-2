import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PaymentProcessingResult {
  status: PaymentStatus;
  error: string;
  paymentAmount: number;
  loading: boolean;
}

type PaymentStatus = 'success' | 'processing' | 'failed' | 'checking';

export const usePaymentProcessing = (
  paymentIntent: string | null,
  redirectStatus: string | null,
  userId: string | null
) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !paymentIntent) {
      setStatus('failed');
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    if (redirectStatus === 'succeeded') {
      setStatus('success');
      toast.success('Payment successful!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setStatus('failed');
      setError('Payment failed');
    }

    setLoading(false);
  }, [userId, paymentIntent, redirectStatus, navigate]);

  return { status, error, paymentAmount, loading };
};
