import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { UserRoleSelector } from "@/components/admin/user-role-selector";
import { UserSubscriptionSelector } from "@/components/admin/user-subscription-selector";
import { BanUserButton } from "@/components/admin/ban-user-button";
import { currentUser } from "@clerk/nextjs/server";
import { Users, Shield, Crown, User } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const user = await currentUser();
  const currentUserId = user?.id;

  const dbUser = user
    ? await prisma.user.findUnique({
        where: { clerkId: user.id },
      })
    : null;

  // Статистика по ролям
  const roleStats = {
    OWNER: users.filter((u) => u.role === "OWNER").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    USER: users.filter((u) => u.role === "USER").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Пользователи</h2>
          <p className="text-slate-500 mt-1">
            Управление пользователями платформы
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-600">{users.length}</span>
          <span className="text-slate-500">пользователей</span>
        </div>
      </div>

      {/* Role Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
          <Crown className="w-3 h-3 text-amber-600" />
          <span className="text-sm text-amber-700">
            Владельцы: {roleStats.OWNER}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-200">
          <Shield className="w-3 h-3 text-violet-600" />
          <span className="text-sm text-violet-700">
            Админы: {roleStats.ADMIN}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
          <User className="w-3 h-3 text-slate-600" />
          <span className="text-sm text-slate-700">
            Пользователи: {roleStats.USER}
          </span>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  Пользователь
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Роль
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Подписка
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Регистрация
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.name?.charAt(0) || "?"
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">
                          {u.name || "Без имени"}
                        </span>
                        {u.isBanned && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Заблокирован
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    <UserRoleSelector
                      userId={u.id}
                      currentRole={u.role}
                      viewerRole={dbUser?.role}
                      disabled={u.clerkId === currentUserId}
                    />
                  </TableCell>
                  <TableCell>
                    <UserSubscriptionSelector
                      userId={u.id}
                      currentPlan={u.subscriptionPlan}
                      disabled={
                        dbUser?.role !== "OWNER" && dbUser?.role !== "ADMIN"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(u.createdAt, "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.clerkId !== currentUserId && (
                      <div className="flex items-center justify-end gap-1">
                        <BanUserButton
                          userId={u.id}
                          isBanned={u.isBanned}
                          disabled={
                            u.role === "OWNER" ||
                            (u.role === "ADMIN" && dbUser?.role !== "OWNER")
                          }
                        />
                        <DeleteUserButton userId={u.id} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Пользователей пока нет</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
