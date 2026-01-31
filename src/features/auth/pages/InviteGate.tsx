import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { sendMagicLink } from '../api';
import toast from 'react-hot-toast';

// Step 1: Validate Invite Code Format (simple non-empty check for now)
const codeSchema = z.object({
  code: z.string().min(3, "Code is too short"),
});

// Step 2: Validate Email
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type CodeForm = z.infer<typeof codeSchema>;
type EmailForm = z.infer<typeof emailSchema>;

export const InviteGate: React.FC = () => {
  const [step, setStep] = useState<'CODE' | 'EMAIL' | 'SENT'>('CODE');
  const [inviteCode, setInviteCode] = useState('');

  const { register: registerCode, handleSubmit: handleCodeSubmit, formState: { errors: codeErrors } } = useForm<CodeForm>({
    resolver: zodResolver(codeSchema)
  });

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors, isSubmitting: isEmailSubmitting } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema)
  });

  const onCodeSubmit = (data: CodeForm) => {
    setInviteCode(data.code);
    // Store code in sessionStorage to claim after login
    sessionStorage.setItem('pending_invite_code', data.code);
    setStep('EMAIL');
  };

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      await sendMagicLink(data.email);
      setStep('SENT');
      toast.success("Magic link sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-brand-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemma 15</h1>
          <p className="text-gray-500">Welcome to the celebration</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'CODE' && (
            <motion.form 
              key="code-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCodeSubmit(onCodeSubmit)} 
              className="space-y-4"
            >
              <Input 
                label="Invite Code" 
                placeholder="ENTER-CODE" 
                {...registerCode('code')}
                error={codeErrors.code?.message}
                autoFocus
              />
              <Button type="submit" className="w-full">
                Verify Code
              </Button>
            </motion.form>
          )}

          {step === 'EMAIL' && (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailSubmit(onEmailSubmit)} 
              className="space-y-4"
            >
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4">
                Code applied: <span className="font-mono font-bold">{inviteCode}</span>
                <button type="button" onClick={() => setStep('CODE')} className="ml-2 text-brand-500 hover:underline">Change</button>
              </div>
              <Input 
                label="Email Address" 
                placeholder="you@example.com" 
                type="email"
                {...registerEmail('email')}
                error={emailErrors.email?.message}
                autoFocus
              />
              <Button type="submit" className="w-full" isLoading={isEmailSubmitting}>
                Send Magic Link
              </Button>
            </motion.form>
          )}

          {step === 'SENT' && (
            <motion.div
              key="sent-msg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-5xl">📧</div>
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-gray-600">
                We sent a magic link to verify your account. 
                Click it to enter the app.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};