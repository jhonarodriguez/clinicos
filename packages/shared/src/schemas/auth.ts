import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const RegisterTenantSchema = z.object({
  tenantName: z.string().min(3, 'Nombre mínimo 3 caracteres').max(200),
  nit: z
    .string()
    .regex(/^\d{9,10}$/, 'NIT debe tener 9-10 dígitos sin guión'),
  adminEmail: z.string().email('Email inválido'),
  adminPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  adminFirstName: z.string().min(2).max(100),
  adminLastName: z.string().min(2).max(100),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type LoginDto = z.infer<typeof LoginSchema>
export type RegisterTenantDto = z.infer<typeof RegisterTenantSchema>
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>
