import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { updateProfile } from '../api';
import { useAuth } from '../../../app/providers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  first_name: z.string().min(2, "Required"),
  last_name: z.string().min(2, "Required"),
  is_celiac: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfileSetup: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      is_celiac: false
    }
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) => {
      if (!user) throw new Error("No authenticated user found");
      // Include email in case we are creating the row from scratch via upsert
      return updateProfile(user.id, {
        ...data,
        email: user.email || '' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Profile saved!");
      navigate('/');
    },
    onError: (err: any) => {
      console.error("Profile save failed:", err);
      // Show the ACTUAL error message to allow debugging
      toast.error(`Error: ${err.message || 'Could not save profile'}`);
    }
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6">Complete your Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="First Name" 
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input 
            label="Last Name" 
            {...register('last_name')}
            error={errors.last_name?.message}
          />
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="celiac" 
              className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500 border-gray-300"
              {...register('is_celiac')}
            />
            <label htmlFor="celiac" className="text-sm text-gray-700">I am celiac (Gluten Free)</label>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save & Continue
          </Button>
        </form>
      </div>
    </div>
  );
};