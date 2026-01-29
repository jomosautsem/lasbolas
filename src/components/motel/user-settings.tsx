'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';

interface UserSettingsProps {
    userEmail: string | undefined;
    onUpdateEmail: (newEmail: string) => Promise<void>;
    onUpdatePassword: (newPassword: string) => Promise<void>;
}

export default function UserSettings({ userEmail, onUpdateEmail, onUpdatePassword }: UserSettingsProps) {
    const { toast } = useToast();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleUpdateEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, ingrese un nuevo correo.' });
            return;
        }
        setIsEmailLoading(true);
        await onUpdateEmail(newEmail);
        setNewEmail('');
        setIsEmailLoading(false);
    };

    const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
             toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
            return;
        }
        setIsPasswordLoading(true);
        await onUpdatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordLoading(false);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Correo Electrónico</CardTitle>
                    <CardDescription>Su correo actual es <span className="font-semibold">{userEmail}</span>. Recibirá un enlace de confirmación.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateEmailSubmit}>
                    <CardContent>
                        <Label htmlFor="new-email">Nuevo Correo Electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="new-email" type="email" placeholder="nuevo@correo.com" className="pl-8" value={newEmail} onChange={e => setNewEmail(e.target.value)} required disabled={isEmailLoading}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isEmailLoading}>
                            {isEmailLoading ? 'Actualizando...' : 'Actualizar Correo'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>Asegúrese de usar una contraseña segura.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleUpdatePasswordSubmit}>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <div className="relative">
                                 <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="new-password" type="password" placeholder="••••••••" className="pl-8" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={isPasswordLoading}/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                             <div className="relative">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="confirm-password" type="password" placeholder="••••••••" className="pl-8" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={isPasswordLoading}/>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" disabled={isPasswordLoading}>
                            {isPasswordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
