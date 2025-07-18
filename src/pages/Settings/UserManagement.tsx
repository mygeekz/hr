import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm, UserFormValues } from './UserForm';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users');
  return data;
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: (userData: UserFormValues) => {
      const url = selectedUser ? `/users/${selectedUser.id}` : '/users';
      const method = selectedUser ? 'put' : 'post';
      return api[method](url, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(selectedUser ? 'کاربر با موفقیت ویرایش شد' : 'کاربر با موفقیت ایجاد شد');
      setModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'خطایی رخ داد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت حذف شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'خطا در حذف کاربر');
    },
  });

  const handleOpenModal = (user: User | null = null) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      deleteMutation.mutate(userId);
    }
  };

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (isError) return <div>خطا در دریافت اطلاعات</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت کاربران</CardTitle>
        <Button onClick={() => handleOpenModal()}>افزودن کاربر جدید</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام کامل</TableHead>
              <TableHead>نام کاربری</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(user)}>
                    ویرایش
                  </Button>
                  <Button variant="destructive" size="sm" className="mr-2" onClick={() => handleDelete(user.id)}>
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={(values) => mutation.mutate(values)}
            initialData={selectedUser}
            isSubmitting={mutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
