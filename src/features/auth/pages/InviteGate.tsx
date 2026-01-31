import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { claimInviteCode } from '../api';
import { useAuth } from '../../../app/providers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const codeSchema = z.object({
  code: z.string().min(3, "Code is too short"),
});

type CodeForm = z.infer<typeof codeSchema>;

export const InviteGate: React.FC = () => {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CodeForm>({
    resolver: zodResolver(codeSchema)
  });

  const onCodeSubmit = async (data: CodeForm) => {
    try {
      await claimInviteCode(data.code);
      toast.success("Welcome!");
      
      // Refresh profile to update Context state (role, segment)
      await refreshProfile();
      
      // Navigation handled by ProtectedRoute, but we can push just in case
      navigate('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Invalid or used code");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-brand-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemma 15</h1>
          <p className="text-gray-500">Enter your invite code to join</p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onCodeSubmit)} 
          className="space-y-4"
        >
          <Input 
            label="Invite Code" 
            placeholder="e.g. G15-Y-12345" 
            {...register('code')}
            error={errors.code?.message}
            autoFocus
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Enter Party
          </Button>
          <p className="text-xs text-center text-gray-400 mt-4">
            No email required. Just the code.
          </p>
        </motion.form>
      </div>
    </div>
  );
};