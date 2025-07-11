// // app/components/auth/LoginForm.tsx
// 'use client';

// import React, { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { Button } from '@components/ui/button';
// import { Input } from '@components/ui/input';
// import { validateUserLogin } from '@utils/validators';
// import { ERROR_MESSAGES } from '@utils/constants';

// export const LoginForm: React.FC = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrors({});

//     try {
//       // Validate form data
//      const validation = validateUserLogin(formData);
//       if (!validation.success) {
//         const newErrors: Record<string, string> = {};
//         for (const error of validation.error.errors) {
//           const path = error.path[0];
//           if (typeof path === 'string') {
//             newErrors[path] = error.message;
//           }
//         }
//         setErrors(newErrors);
//         setIsLoading(false);
//         return;
//       }
//       // Sign in
//       const result = await signIn('credentials', {
//         email: formData.email,
//         password: formData.password,
//         redirect: false,
//       });

//       if (result?.error) {
//         setErrors({ general: result.error });
//       } else if (result?.ok) {
//         router.push('/dashboard');
//       }
//     } catch (error) {
//       setErrors({ general: ERROR_MESSAGES.GENERIC });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="mx-auto w-full max-w-md"
//     >
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="mb-8 text-center">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Welcome Back!
//           </h2>
//           <p className="mt-2 text-gray-600 dark:text-gray-400">
//             Sign in to continue your storytelling journey
//           </p>
//         </div>

//         {errors.general && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
//           >
//             {errors.general}
//           </motion.div>
//         )}

//         <Input
//           type="email"
//           name="email"
//           label="Email Address"
//           value={formData.email}
//           onChange={handleChange}
//           error={errors.email}
//           leftIcon={<Mail size={20} />}
//           placeholder="Enter your email"
//           required
//         />

//         <Input
//           type={showPassword ? 'text' : 'password'}
//           name="password"
//           label="Password"
//           value={formData.password}
//           onChange={handleChange}
//           error={errors.password}
//           leftIcon={<Lock size={20} />}
//           rightIcon={
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="transition-colors hover:text-gray-600"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           }
//           placeholder="Enter your password"
//           required
//         />

//         <Button
//           type="submit"
//           variant="primary"
//           size="lg"
//           isLoading={isLoading}
//           className="w-full"
//         >
//           Sign In
//         </Button>
//       </form>
//     </motion.div>
//   );
// };

// app/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { validateUserLogin } from '@utils/validators';
import { ERROR_MESSAGES } from '@utils/constants';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validation = validateUserLogin(formData);
      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach(error => {
          const path = error.path[0];
          if (typeof path === 'string') {
            newErrors[path] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      // Sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: result.error });
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors({ general: ERROR_MESSAGES.GENERIC });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to continue your storytelling journey
          </p>
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            {errors.general}
          </motion.div>
        )}

        <Input
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={20} />}
          placeholder="Enter your email"
          required
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock size={20} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="transition-colors hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          placeholder="Enter your password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>
    </motion.div>
  );
};
